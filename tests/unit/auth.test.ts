import { describe, expect, it } from 'vitest';
import { createAdminSession, validAdminSession, verifyCredentials } from '@/lib/auth';
describe('acesso do docente', () => {
  it('verifica a palavra-passe através de scrypt e falha com credenciais erradas', async () => { expect(await verifyCredentials('docente', 'test-password-only-123')).toBe(true); expect(await verifyCredentials('docente', 'errada')).toBe(false); expect(await verifyCredentials('outro', 'test-password-only-123')).toBe(false); });
  it('exige assinatura válida e expira a sessão em 4 horas', () => { const now = Date.now(); const session = createAdminSession(now); expect(validAdminSession(session, now)).toBe(true); expect(validAdminSession(session, now + 4 * 3600000)).toBe(false); expect(validAdminSession(session.replace(/.$/, session.endsWith('0') ? '1' : '0'), now)).toBe(false); expect(validAdminSession(undefined, now)).toBe(false); });
});
