import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import pg from 'pg';
import net from 'node:net';
import { passwordHash } from './password.mjs';
const ownerUrl = new URL(process.env.MIGRATION_DATABASE_URL || 'postgresql://localhost/invalid');
if (!['localhost', '127.0.0.1'].includes(ownerUrl.hostname) || process.env.DATA_MODE === 'study' || process.env.NODE_ENV === 'production') throw new Error('Testes exigem PostgreSQL local e ambiente de desenvolvimento.');
const suffix = randomBytes(6).toString('hex'), dbName = `reviravolta_test_${suffix}`;
const appRole = `rv_app_test_${suffix}`, readerRole = `rv_reader_test_${suffix}`;
const appPass = randomBytes(32).toString('hex'), readerPass = randomBytes(32).toString('hex');
const owner = new pg.Pool({ connectionString: ownerUrl.toString() });
let testOwner, server, created = false;
const port = 3101, base = `http://localhost:${port}`;
await new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once('error', () => reject(new Error('A porta 3101 está ocupada. Termine o servidor de testes anterior antes de continuar.')));
  probe.listen(port, '127.0.0.1', () => probe.close(resolve));
});
const databaseUrl = (username, password) => { const u = new URL(ownerUrl); u.pathname = `/${dbName}`; u.username = username; u.password = password; return u.toString(); };
function run(file, args, env) {
  return new Promise((resolve, reject) => { const child = spawn(process.execPath, [file, ...args], { env, stdio: 'inherit', windowsHide: true }); child.once('error', reject); child.once('exit', code => code === 0 ? resolve() : reject(new Error(`Verificação terminou com código ${code}.`))); });
}
async function stopServer() {
  if (!server || server.exitCode !== null) return;
  const exited = new Promise(resolve => server.once('exit', resolve));
  if (process.platform === 'win32') {
    const code = await new Promise(resolve => { const killer = spawn('taskkill', ['/pid', String(server.pid), '/t', '/f'], { stdio: 'ignore', windowsHide: true }); killer.once('exit', resolve); killer.once('error', () => resolve(1)); });
    if (code !== 0 && server.exitCode === null) {
      console.error(`Não foi possível terminar o servidor de teste (PID ${server.pid}). Termine essa árvore de processos antes de repetir. A porta ocupada será rejeitada.`);
      process.exitCode = 1; server.stdout.destroy(); server.stderr.destroy(); server.unref();
    }
  }
  else server.kill('SIGTERM');
  await Promise.race([exited, new Promise(resolve => setTimeout(resolve, 5000))]);
}
try {
  await owner.query(`CREATE DATABASE ${dbName}`); created = true;
  await owner.query(`CREATE ROLE ${appRole} LOGIN PASSWORD '${appPass}' NOSUPERUSER NOCREATEDB NOCREATEROLE`);
  await owner.query(`CREATE ROLE ${readerRole} LOGIN PASSWORD '${readerPass}' NOSUPERUSER NOCREATEDB NOCREATEROLE`);
  testOwner = new pg.Pool({ connectionString: databaseUrl(ownerUrl.username, decodeURIComponent(ownerUrl.password)) });
  for (const migration of readdirSync('prisma/migrations', { withFileTypes: true }).filter(entry => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    await testOwner.query(readFileSync(`prisma/migrations/${migration.name}/migration.sql`, 'utf8'));
  }
  await testOwner.query(`REVOKE ALL ON enchimentos FROM PUBLIC; REVOKE CREATE ON SCHEMA public FROM PUBLIC; GRANT USAGE ON SCHEMA public TO ${appRole},${readerRole}; GRANT SELECT,INSERT,DELETE ON enchimentos TO ${appRole}; GRANT SELECT ON enchimentos TO ${readerRole}; GRANT SELECT,UPDATE ON admin_login_throttle TO ${appRole}; ALTER ROLE ${readerRole} SET default_transaction_read_only=on`);
  const password = randomBytes(24).toString('hex');
  const env = { ...process.env, NODE_ENV: 'development', NEXT_TELEMETRY_DISABLED: '1', RV_INTEGRATION_TEST: '1', APP_ORIGIN: base, DATA_MODE: 'development',
    DATABASE_URL: databaseUrl(appRole, appPass), RESEARCH_DATABASE_URL: databaseUrl(readerRole, readerPass),
    MIGRATION_DATABASE_URL: databaseUrl(ownerUrl.username, decodeURIComponent(ownerUrl.password)),
    TOKEN_HMAC_SECRET: randomBytes(32).toString('hex'), SESSION_SECRET: randomBytes(32).toString('hex'), CRON_SECRET: randomBytes(32).toString('hex'),
    ADMIN_USERNAME: 'docente', ADMIN_PASSWORD_HASH: passwordHash(password), TEST_ADMIN_PASSWORD: password,
    TEST_BASE_URL: base, TEST_DATABASE_URL: databaseUrl(ownerUrl.username, decodeURIComponent(ownerUrl.password)),
    STUDY_START: new Date(Date.now() - 25 * 86400000).toISOString(), STUDY_END: new Date(Date.now() + 7 * 86400000).toISOString(),
    MIN_COURSE_PARTICIPANTS: '5', RETENTION_DAYS: '90',
  };
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', String(port)], { env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let diagnostics = ''; server.stdout.on('data', chunk => { diagnostics = (diagnostics + chunk).slice(-4000); }); server.stderr.on('data', chunk => { diagnostics = (diagnostics + chunk).slice(-4000); });
  server.once('error', () => console.error('Não foi possível iniciar o processo Next de teste.'));
  let ready = false;
  for (let i = 0; i < 120; i++) {
    if (server.exitCode !== null) throw new Error('Servidor de teste terminou antes de iniciar.');
    try { const response = await fetch(`${base}/api/session`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base }, body: '{}', signal: AbortSignal.timeout(2000) }); if (response.ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  if (!ready) { console.error(diagnostics.replaceAll(password, '[redigido]')); throw new Error('Servidor de teste indisponível.'); }
  console.log('Servidor de teste ligado a PostgreSQL real numa base temporária isolada.');
  if (!process.argv.includes('--e2e')) await run('node_modules/vitest/vitest.mjs', ['run', '--config', 'vitest.integration.config.ts'], env);
  if (process.argv.includes('--e2e') || process.argv.includes('--all')) {
    await testOwner.query("DELETE FROM enchimentos; UPDATE admin_login_throttle SET attempts = ARRAY[]::timestamptz[] WHERE id = 1");
    await run('node_modules/@playwright/test/cli.js', ['test'], env);
  }
} catch (error) {
  console.error(error instanceof Error && error.message ? error.message.replace(/postgres(?:ql)?:\/\/\S+/g, '[ligação redigida]') : 'Testes indisponíveis. Verifique se o PostgreSQL local está ativo e acessível.'); process.exitCode = 1;
} finally {
  await stopServer(); await testOwner?.end();
  if (created && /^reviravolta_test_[a-f0-9]{12}$/.test(dbName)) {
    await owner.query(`DROP DATABASE IF EXISTS ${dbName} WITH (FORCE)`);
    await owner.query(`DROP ROLE IF EXISTS ${appRole}; DROP ROLE IF EXISTS ${readerRole}`);
    console.log('Base temporária de testes e papéis eliminados.');
  }
  await owner.end();
}
