import 'server-only';
import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { equal, sign } from './crypto';
import { AppError } from './errors';
import { db } from './db';
const derive = promisify(scrypt);
export async function verifyCredentials(username: string, password: string) {
  const [algorithm, salt, hash] = (process.env.ADMIN_PASSWORD_HASH || '').split(':');
  if (algorithm !== 'scrypt' || !/^[a-f0-9]{32}$/.test(salt || '') || !/^[a-f0-9]{128}$/.test(hash || '')) throw new AppError(503, 'Acesso do docente ainda não configurado.');
  const actual = (await derive(password, salt, 64) as Buffer).toString('hex');
  const validPassword = equal(actual, hash);
  return equal(sign('username', username), sign('username', process.env.ADMIN_USERNAME || '')) && validPassword;
}
export function createAdminSession(now = Date.now()) {
  const payload = `${now + 4 * 3600000}.${randomBytes(32).toString('hex')}`;
  return `${payload}.${sign('admin', payload)}`;
}
export function validAdminSession(value: string | undefined, now = Date.now()) {
  if (!value || value.length > 160) return false;
  const [expires, nonce, mac, extra] = value.split('.');
  if (extra || !/^\d{13}$/.test(expires) || !/^[a-f0-9]{64}$/.test(nonce || '') || !mac) return false;
  return +expires > now && +expires <= now + 4 * 3600000 && equal(mac, sign('admin', `${expires}.${nonce}`));
}
export async function loginLimit() {
  const allowed = await db().$transaction(async tx => {
    // O bloqueio da linha é partilhado por todas as instâncias, também com pooler transacional.
    const rows = await tx.$queryRaw<{ id: number }[]>`SELECT id FROM admin_login_throttle WHERE id = 1 FOR UPDATE`;
    if (rows.length !== 1) throw new Error('Limite de login não configurado. Aplique as migrações.');
    const updated = await tx.$queryRaw<{ id: number }[]>`
      UPDATE admin_login_throttle
      SET attempts = ARRAY(SELECT t FROM unnest(attempts) AS t WHERE t > clock_timestamp() - interval '15 minutes') || clock_timestamp()
      WHERE id = 1 AND (SELECT count(*) FROM unnest(attempts) AS t WHERE t > clock_timestamp() - interval '15 minutes') < 10
      RETURNING id`;
    return updated.length === 1;
  }, { timeout: 10000 });
  if (!allowed) throw new AppError(429, 'Limite de tentativas atingido. Aguarda 15 minutos.');
}
