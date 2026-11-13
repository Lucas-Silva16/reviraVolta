import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
export type Variant = 'A' | 'B';
function secret(name: string) {
  const value = process.env[name];
  if (!value || !/^[0-9a-f]{64,}$/i.test(value)) throw new Error(`Configure ${name} com pelo menos 32 bytes aleatórios hexadecimais.`);
  return Buffer.from(value, 'hex');
}
export const newToken = () => randomBytes(32).toString('hex');
export const validToken = (token: unknown): token is string => typeof token === 'string' && /^[a-f0-9]{64}$/.test(token);
export function tokenHash(token: string) {
  return createHmac('sha256', secret('TOKEN_HMAC_SECRET')).update(token).digest('hex');
}
// Um bit uniforme do HMAC: 0 => A, 1 => B. Independente do curso.
export function variantFor(hash: string): Variant { return parseInt(hash.slice(0, 2), 16) % 2 === 0 ? 'A' : 'B'; }
export function sign(purpose: string, value: string) {
  return createHmac('sha256', secret('SESSION_SECRET')).update(`${purpose}\0${value}`).digest('hex');
}
export function equal(a: string, b: string) {
  const left = Buffer.from(a), right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
export const csrfFor = (token: string) => sign('csrf', token);
export function submissionRecordId(hash: string, submissionId: string) {
  const h = createHash('sha256').update(`${hash}:${submissionId}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}
