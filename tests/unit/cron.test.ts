import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const mocks = vi.hoisted(() => ({ transaction: vi.fn(), remove: vi.fn(), execute: vi.fn() }));
vi.mock('@/lib/db', () => ({ db: () => ({ $transaction: mocks.transaction }) }));
import { GET, HEAD } from '@/app/api/cron/retention/route';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.remove.mockResolvedValue({ count: 2 });
  mocks.execute.mockResolvedValue(1);
  mocks.transaction.mockImplementation(fn => fn({ enchimento: { deleteMany: mocks.remove }, $executeRaw: mocks.execute }));
});
afterEach(() => vi.unstubAllEnvs());
const request = (value?: string) => new NextRequest('https://campus.example/api/cron/retention', { headers: value ? { Authorization: value } : {} });
describe('cron de retenção', () => {
  it('recusa segredo ausente ou incorreto sem tocar na BD', async () => {
    vi.stubEnv('CRON_SECRET', ''); expect((await GET(request('Bearer undefined'))).status).toBe(401);
    vi.stubEnv('CRON_SECRET', 'secret'); expect((await GET(request())).status).toBe(401);
    expect((await GET(request('Bearer wrong'))).status).toBe(401);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it('não executa a limpeza em previews nem em HEAD', async () => {
    vi.stubEnv('CRON_SECRET', 'secret'); vi.stubEnv('VERCEL_ENV', 'preview');
    expect((await GET(request('Bearer secret'))).status).toBe(403);
    expect(HEAD().status).toBe(405); expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it('aplica um limite de data, sem permitir apagar todo o histórico', async () => {
    vi.stubEnv('CRON_SECRET', 'secret'); vi.stubEnv('VERCEL_ENV', 'production'); vi.stubEnv('RETENTION_DAYS', '90');
    const now = Date.now(), response = await GET(request('Bearer secret'));
    expect(response.status).toBe(200); expect(await response.json()).toEqual({ deleted: 2 });
    const cutoff = mocks.remove.mock.calls[0][0].where.created_at.lt;
    expect(+cutoff).toBeGreaterThanOrEqual(now - 90 * 86400000);
    expect(+cutoff).toBeLessThanOrEqual(Date.now() - 90 * 86400000);
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
});
