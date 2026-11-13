import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import pg from 'pg';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const base = process.env.TEST_BASE_URL!;
const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
if (!new URL(process.env.TEST_DATABASE_URL!).pathname.startsWith('/reviravolta_test_')) throw new Error('Base não isolada.');
const hashOf = (token: string) => createHmac('sha256', Buffer.from(process.env.TOKEN_HMAC_SECRET!, 'hex')).update(token).digest('hex');
type Identity = { cookie: string; csrf: string; token: string; hash: string };
async function identity(variant?: 'A' | 'B'): Promise<Identity> {
  let cookie = '';
  if (variant) { let token; do { token = randomBytes(32).toString('hex'); } while ((parseInt(hashOf(token).slice(0, 2), 16) % 2 === 0 ? 'A' : 'B') !== variant); cookie = `rv-participant=${token}`; }
  const response = await fetch(`${base}/api/session`, { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json', Cookie: cookie }, body: '{}' });
  cookie ||= response.headers.get('set-cookie')!.split(';')[0];
  const token = cookie.split('=')[1]; const { csrf } = await response.json(); return { cookie, csrf, token, hash: hashOf(token) };
}
const headers = (who: Identity) => ({ Origin: base, 'Content-Type': 'application/json', Cookie: who.cookie, 'X-CSRF-Token': who.csrf });
const refill = (who: Identity, extra = {}) => fetch(`${base}/api/enchimentos`, { method: 'POST', headers: headers(who), body: JSON.stringify({ curso: 'Design', litros: 0.5, submissionId: randomUUID(), ...extra }) });
const impact = async (who: Identity) => (await fetch(`${base}/api/impacto`, { headers: { Cookie: who.cookie } })).json();
async function admin() {
  const who = await identity(); const response = await fetch(`${base}/api/admin/login`, { method: 'POST', headers: headers(who), body: JSON.stringify({ username: 'docente', password: process.env.TEST_ADMIN_PASSWORD }) });
  expect(response.status).toBe(200); return { ...who, cookie: `${who.cookie}; ${response.headers.get('set-cookie')!.split(';')[0]}` };
}
beforeEach(async () => { await pool.query("DELETE FROM enchimentos; UPDATE admin_login_throttle SET attempts = ARRAY[]::timestamptz[] WHERE id = 1"); });
afterAll(async () => { await pool.end(); });
describe('API e PostgreSQL real', () => {
  it('limita logins concorrentes com estado partilhado e permite novas tentativas após a janela', async () => {
    const who = await identity();
    const attempt = () => fetch(`${base}/api/admin/login`, { method: 'POST', headers: headers(who), body: JSON.stringify({ username: 'docente', password: 'incorrect-password-123' }) });
    const replies = await Promise.all(Array.from({ length: 15 }, attempt));
    expect(replies.filter(r => r.status === 401)).toHaveLength(10);
    expect(replies.filter(r => r.status === 429)).toHaveLength(5);
    expect((await pool.query('SELECT cardinality(attempts) AS count FROM admin_login_throttle')).rows[0].count).toBe(10);
    await pool.query("UPDATE admin_login_throttle SET attempts = ARRAY[now() - interval '16 minutes']");
    expect((await attempt()).status).toBe(401);
    expect((await pool.query('SELECT cardinality(attempts) AS count FROM admin_login_throttle')).rows[0].count).toBe(1);
    const readOnly = new pg.Pool({ connectionString: process.env.RESEARCH_DATABASE_URL });
    try { await expect(readOnly.query('SELECT * FROM admin_login_throttle')).rejects.toThrow(); } finally { await readOnly.end(); }
  });
  it('cron exige o segredo, ignora HEAD e elimina só os registos fora da retenção', async () => {
    const who = await identity(); await refill(who);
    await pool.query("INSERT INTO enchimentos VALUES ($1,$2,'Design',0.5,now()-interval '100 days')", [randomUUID(), who.hash]);
    const url = `${base}/api/cron/retention`, auth = { Authorization: `Bearer ${process.env.CRON_SECRET}` };
    expect((await fetch(url)).status).toBe(401);
    expect((await fetch(url, { headers: { Authorization: 'Bearer incorrect' } })).status).toBe(401);
    expect((await fetch(url, { method: 'HEAD', headers: auth })).status).toBe(405);
    expect((await pool.query('SELECT COUNT(*) FROM enchimentos')).rows[0].count).toBe('2');
    const response = await fetch(url, { headers: auth });
    expect(response.status).toBe(200); expect(await response.json()).toEqual({ deleted: 1 });
    expect((await fetch(url, { headers: auth })).status).toBe(200);
    expect((await pool.query('SELECT COUNT(*) FROM enchimentos')).rows[0].count).toBe('1');
  });
  it('primeiro acesso não conta como participante, cookie persiste, BD guarda apenas HMAC e timestamp UTC', async () => {
    const who = await identity(); expect((await pool.query('SELECT COUNT(*) FROM enchimentos')).rows[0].count).toBe('0');
    const revisit = await fetch(`${base}/api/session`, { method: 'POST', headers: headers(who), body: '{}' }); expect(revisit.headers.get('set-cookie')).toBeNull(); expect((await revisit.json()).csrf).toBe(who.csrf);
    const response = await refill(who); expect(response.status).toBe(201); const json = await response.json(); expect(json.createdAt).toMatch(/Z$/);
    const result = await pool.query('SELECT * FROM enchimentos'); expect(result.rows).toHaveLength(1); expect(Object.keys(result.rows[0]).sort()).toEqual(['created_at', 'curso', 'id', 'quantidade_litros', 'token_hash']);
    expect(result.rows[0].token_hash).toBe(who.hash); expect(JSON.stringify(result.rows)).not.toContain(who.token);
  });
  it('deduplica pedidos concorrentes e rejeita reutilização da chave com conteúdo diferente', async () => {
    const who = await identity(), submissionId = randomUUID();
    const responses = await Promise.all(Array.from({ length: 6 }, () => refill(who, { submissionId })));
    expect(responses.map(r => r.status).sort()).toEqual([200, 200, 200, 200, 200, 201]);
    expect((await pool.query('SELECT COUNT(*) FROM enchimentos')).rows[0].count).toBe('1');
    expect((await refill(who, { submissionId, litros: 1 })).status).toBe(409);
    expect((await refill(who)).status).toBe(429);
  });
  it('aplica limites diários por token, mesmo após ultrapassar o intervalo mínimo', async () => {
    const who = await identity();
    for (let i = 0; i < 20; i++) await pool.query("INSERT INTO enchimentos VALUES ($1,$2,'Design',0.5,date_trunc('day',now()))", [randomUUID(), who.hash]);
    expect((await refill(who)).status).toBe(429); expect((await refill(await identity())).status).toBe(201);
  });
  it('bloqueia valores inválidos, campos adicionais, origem externa, CSRF e payloads grandes', async () => {
    const who = await identity();
    for (const extra of [{ litros: 0 }, { litros: 5.1 }, { litros: '1' }, { litros: .123 }, { curso: '<script>' }, { variant: 'B' }, { created_at: '2020-01-01' }]) expect((await refill(who, extra)).status).toBe(400);
    expect((await fetch(`${base}/api/enchimentos`, { method: 'POST', headers: { ...headers(who), Origin: 'https://evil.example' }, body: '{}' })).status).toBe(403);
    expect((await fetch(`${base}/api/enchimentos`, { method: 'POST', headers: { ...headers(who), 'X-CSRF-Token': '' }, body: '{}' })).status).toBe(403);
    expect((await fetch(`${base}/api/enchimentos`, { method: 'POST', headers: headers(who), body: JSON.stringify({ extra: 'x'.repeat(5000) }) })).status).toBe(413);
    expect((await pool.query('SELECT COUNT(*) FROM enchimentos')).rows[0].count).toBe('0');
  });
  it('isola o módulo B, conta só participantes B e oculta cursos abaixo de cinco pessoas', async () => {
    const a = await identity('A'), b = await identity('B');
    await refill(a, { litros: 5 }); await refill(b, { litros: 2 });
    expect(await impact(a)).not.toHaveProperty('collective'); expect((await impact(b)).collective).toEqual({ visible: false, minimum: 5 });
    for (let i = 0; i < 3; i++) await refill(await identity('B'), { litros: 2 });
    expect((await impact(b)).collective.visible).toBe(false);
    await refill(await identity('B'), { litros: 2 });
    expect((await impact(b)).collective).toMatchObject({ visible: true, liters: 10, course: 'Design' });
    expect((await impact(a)).variant).toBe('A');
  });
  it('elimina só o histórico do navegador, exige confirmação e mantém a versão', async () => {
    const who = await identity('B'), other = await identity(); await refill(who); await refill(other);
    expect((await fetch(`${base}/api/historico`, { method: 'DELETE', headers: headers(who), body: '{}' })).status).toBe(400);
    const deleted = await fetch(`${base}/api/historico`, { method: 'DELETE', headers: headers(who), body: '{"confirm":"ELIMINAR"}' }); expect((await deleted.json()).deleted).toBe(1);
    const data = await impact(who); expect(data.refills).toBe(0); expect(data.variant).toBe('B'); expect((await impact(other)).refills).toBe(1);
  });
  it('protege docente, métricas e exportação; o papel PostgreSQL de leitura não pode escrever', async () => {
    expect((await fetch(`${base}/api/admin/metrics`)).status).toBe(401); expect((await fetch(`${base}/api/admin/export`)).status).toBe(401);
    const who = await admin();
    const reader = new pg.Pool({ connectionString: process.env.RESEARCH_DATABASE_URL });
    try { await expect(reader.query('DELETE FROM enchimentos')).rejects.toThrow(); await expect(reader.query("INSERT INTO enchimentos VALUES ($1,$2,'Design',1,now())", [randomUUID(), randomBytes(32).toString('hex')])).rejects.toThrow(); } finally { await reader.end(); }
    expect((await fetch(`${base}/api/admin/metrics`, { method: 'DELETE', headers: headers(who) })).status).toBe(405);
    const logout = await fetch(`${base}/api/admin/logout`, { method: 'POST', headers: headers(who), body: '{}' }); expect(logout.headers.get('set-cookie')).toContain('Max-Age=0');
  });
  it('apresenta COUNT DISTINCT e comparação A/B real, CSV privado e datas UTC', async () => {
    const a = await identity('A'), b = await identity('B'); await refill(a, { litros: 1 }); await refill(b, { litros: 2 });
    await pool.query("INSERT INTO enchimentos VALUES ($1,$2,'Design',0.5,now()-interval '1 day')", [randomUUID(), a.hash]);
    const who = await admin(), metrics = await (await fetch(`${base}/api/admin/metrics`, { headers: headers(who) })).json();
    expect(metrics.distinctFromDatabase).toBe(2); expect(metrics.totals.refills).toBe(3); expect(metrics.groups.A.meanRefills).toBe(2); expect(metrics.groups.B.meanRefills).toBe(1); expect(metrics.groups.A.returnRate).toBe(1);
    const csvResponse = await fetch(`${base}/api/admin/export`, { headers: headers(who) }); expect(csvResponse.headers.get('cache-control')).toContain('no-store'); const csv = await csvResponse.text();
    expect(csv).toContain(a.hash); expect(csv).not.toContain(a.token); expect(csv).toMatch(/\.\d{3}Z/); expect(csv.split('\r\n')).toHaveLength(4);
    expect(metrics).not.toHaveProperty('records'); expect(metrics.league).toHaveLength(0);
  });
  it('retém só o prazo definido e o seed recusa bases de teste ou estudo', async () => {
    const who = await identity(); await refill(who);
    await pool.query("INSERT INTO enchimentos VALUES ($1,$2,'Design',0.5,now()-interval '100 days')", [randomUUID(), who.hash]);
    expect((await impact(who)).refills).toBe(1);
    const run = promisify(execFile);
    const result = await run(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'scripts/retention.ts'], { env: process.env, windowsHide: true });
    expect(result.stdout).toContain('1 registos eliminados'); expect((await pool.query('SELECT COUNT(*) FROM enchimentos')).rows[0].count).toBe('1');
    await expect(run(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'prisma/seed.ts'], { env: process.env, windowsHide: true })).rejects.toThrow();
    expect((await pool.query('SELECT COUNT(*) FROM enchimentos')).rows[0].count).toBe('1');
  });
});
