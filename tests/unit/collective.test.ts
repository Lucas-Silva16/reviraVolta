import { beforeEach, describe, expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => ({ enchimento: { aggregate: vi.fn(), findFirst: vi.fn() }, $queryRaw: vi.fn() }));
vi.mock('@/lib/db', () => ({ db: () => mock }));
import { individualImpact } from '@/lib/refills';
beforeEach(() => { vi.clearAllMocks(); mock.enchimento.aggregate.mockResolvedValue({ _count: 1, _sum: { quantidade_litros: .5 } }); mock.enchimento.findFirst.mockResolvedValue({ curso: 'Design', created_at: new Date() }); });
describe('privacidade e única diferença A/B', () => {
  it('não consulta nem devolve o coletivo para A', async () => { const data = await individualImpact('00'.padEnd(64, '0')); expect(data).not.toHaveProperty('collective'); expect(mock.$queryRaw).not.toHaveBeenCalled(); });
  it('oculta totais e contagens abaixo do limiar em B', async () => { mock.$queryRaw.mockResolvedValue([{ people: 4n, liters: 99 }]); const data = await individualImpact('01'.padEnd(64, '0')); expect(data).toHaveProperty('collective', { visible: false, minimum: 5 }); expect(JSON.stringify(data)).not.toContain('99'); });
  it('mostra valores conservadores apenas após o limiar, mantendo os mesmos dados individuais', async () => { mock.$queryRaw.mockResolvedValue([{ people: 5n, liters: 18.75 }]); const a = await individualImpact('00'.padEnd(64, '0')); const b = await individualImpact('01'.padEnd(64, '0')); expect(b).toHaveProperty('collective.liters', 15); for (const key of ['totalLiters', 'refills', 'estimatedEuros', 'bottleEquivalents'] as const) expect(b[key]).toBe(a[key]); });
});
