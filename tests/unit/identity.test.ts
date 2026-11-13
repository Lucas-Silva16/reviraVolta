import { describe, expect, it } from 'vitest';
import { createHmac } from 'node:crypto';
import { NextRequest } from 'next/server';
import { newToken, tokenHash, variantFor, csrfFor, submissionRecordId } from '@/lib/crypto';
import { POST } from '@/app/api/session/route';
import { mutationGuard } from '@/lib/http';
describe('identificador pseudónimo e proteção dos pedidos', () => {
  it('gera 256 bits imprevisíveis e aplica HMAC, sem devolver o token no JSON', async () => {
    const a = newToken(), b = newToken(); expect(a).toMatch(/^[a-f0-9]{64}$/); expect(a).not.toBe(b);
    expect(tokenHash(a)).toBe(createHmac('sha256', Buffer.from(process.env.TOKEN_HMAC_SECRET!, 'hex')).update(a).digest('hex'));
    expect(tokenHash(a)).not.toBe(a);
    const response = await POST(new NextRequest('http://localhost:3000/api/session', { method: 'POST', headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' } }));
    expect(response.status).toBe(200); const cookie = response.headers.get('set-cookie')!;
    expect(cookie).toContain('HttpOnly'); expect(cookie).toContain('SameSite=strict'); expect(cookie).toContain('Path=/'); expect(cookie).toContain('Max-Age=');
    expect(Object.keys(await response.json())).toEqual(['csrf']);
  });
  it('mantém o identificador entre visitas e não renova a validade silenciosamente', async () => {
    const token = newToken();
    const response = await POST(new NextRequest('http://localhost:3000/api/session', { method: 'POST', headers: { origin: 'http://localhost:3000', 'content-type': 'application/json', cookie: `rv-participant=${token}` } }));
    expect(response.headers.get('set-cookie')).toBeNull(); expect((await response.json()).csrf).toBe(csrfFor(token));
  });
  it('atribui A/B de forma estável e independente do curso, aproximadamente 50/50', () => {
    let groupA = 0;
    for (let i = 0; i < 2000; i++) { const h = tokenHash(newToken()); const v = variantFor(h); expect(variantFor(h)).toBe(v); groupA += v === 'A' ? 1 : 0; }
    expect(groupA).toBeGreaterThan(850); expect(groupA).toBeLessThan(1150);
    expect(variantFor('00'.padEnd(64, '0'))).toBe('A'); expect(variantFor('01'.padEnd(64, '0'))).toBe('B');
  });
  it('rejeita origem externa, ausência de CSRF e CSRF de outro token', async () => {
    const token = newToken();
    for (const [origin, csrf] of [['https://evil.example', csrfFor(token)], ['http://localhost:3000', ''], ['http://localhost:3000', csrfFor(newToken())]]) {
      const req = new NextRequest('http://localhost:3000/api/enchimentos', { method: 'POST', headers: { origin, 'content-type': 'application/json', cookie: `rv-participant=${token}`, 'x-csrf-token': csrf } });
      expect(() => mutationGuard(req)).toThrow();
    }
    const response = await POST(new NextRequest('http://localhost:3000/api/session', { method: 'POST', headers: { origin: 'https://evil.example', 'content-type': 'application/json' } })); expect(response.status).toBe(403);
  });
  it('isola chaves de idempotência por participante', () => {
    const submission = crypto.randomUUID(); const h = tokenHash(newToken());
    expect(submissionRecordId(h, submission)).toBe(submissionRecordId(h, submission));
    expect(submissionRecordId(h, submission)).not.toBe(submissionRecordId(tokenHash(newToken()), submission));
  });
});
