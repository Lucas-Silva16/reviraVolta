// Alternativa opcional de desenvolvimento quando Docker não está disponível.
// Instalar separadamente: npm install --prefix .local/pg-tools embedded-postgres
import 'dotenv/config';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
if (process.env.NODE_ENV === 'production' || process.env.DATA_MODE === 'study') throw new Error('Servidor opcional permitido apenas em desenvolvimento.');
const modulePath = resolve('.local/pg-tools/node_modules/embedded-postgres/dist/index.js');
if (!existsSync(modulePath)) throw new Error('Instale embedded-postgres em .local/pg-tools ou use Docker Compose.');
const { default: EmbeddedPostgres } = await import(pathToFileURL(modulePath).href);
const databaseDir = resolve('.local/postgres');
const pg = new EmbeddedPostgres({
  databaseDir, user: 'reviravolta_owner', password: process.env.POSTGRES_PASSWORD,
  port: 5432, persistent: true, authMethod: 'scram-sha-256',
  initdbFlags: ['--encoding=UTF8', '--locale=C'],
  postgresFlags: ['-c', 'listen_addresses=127.0.0.1', '-c', 'log_statement=none', '-c', 'log_min_error_statement=panic', '-c', 'log_connections=off', '-c', 'log_disconnections=off', '-c', 'log_parameter_max_length_on_error=0'],
  onLog: () => {}, onError: () => {},
});
try {
  if (!existsSync(resolve(databaseDir, 'PG_VERSION'))) await pg.initialise();
  await pg.start();
  const client = pg.getPgClient(); await client.connect();
  const result = await client.query("SELECT 1 FROM pg_database WHERE datname='reviravolta'");
  if (!result.rowCount) await client.query('CREATE DATABASE reviravolta');
  await client.end();
  console.log('PostgreSQL local ativo em 127.0.0.1:5432. Apenas desenvolvimento. Ctrl+C para parar.');
} catch { console.error('Falha ao iniciar PostgreSQL local. Verifique a porta 5432, os binários e as permissões.'); await pg.stop().catch(() => {}); process.exit(1); }
let stopping = false;
async function stop() { if (stopping) return; stopping = true; await pg.stop(); process.exit(0); }
process.on('SIGINT', stop); process.on('SIGTERM', stop);
setInterval(() => {}, 60000);
