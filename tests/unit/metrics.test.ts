import { describe, expect, it } from 'vitest';
import { calculateMetrics, recordsCsv, weekKey, type ResearchRow } from '@/lib/metrics';
import { courseFamily } from '@/lib/config';
const A = '00'.padEnd(64, '0'), B = '01'.padEnd(64, '0');
const rows: ResearchRow[] = [
  { token_hash: A, curso: 'Biologia', quantidade_litros: 0.5, created_at: new Date('2026-11-13T12:00:00Z') },
  { token_hash: A, curso: 'Biologia', quantidade_litros: 1, created_at: new Date('2026-11-14T12:00:00Z') },
  { token_hash: B, curso: 'Design', quantidade_litros: 2, created_at: new Date('2026-11-13T13:00:00Z') },
];
describe('métricas reais e exportação', () => {
  it('conta identificadores distintos, inclui apenas um registo e separa A/B', () => {
    const data = calculateMetrics(rows, new Date('2026-11-13'), new Date('2026-12-04'), new Date('2026-11-15'));
    expect(data.totals.participants).toBe(2); expect(data.totals.refills).toBe(3); expect(data.totals.liters).toBe(3.5);
    expect(data.groups.A.meanRefills).toBe(2); expect(data.groups.B.meanRefills).toBe(1); expect(data.groups.B.participants).toBe(1);
    expect(data.groups.A.returnRate).toBe(1); expect(data.groups.B.returnRate).toBe(0); expect(data.totals.returnRate).toBe(.5);
    expect(data.deltaMeanRefills).toBe(-1); expect(data.weekly[0].refills).toBe(3); expect(data.daily).toHaveLength(2);
  });
  it('não confunde dois registos no mesmo dia com retorno e usa intervalos [início,fim)', () => {
    const repeated = [rows[0], { ...rows[0], created_at: new Date('2026-11-13T13:00:00Z') }, rows[1]];
    const data = calculateMetrics(repeated, new Date('2026-11-13'), new Date('2026-11-14T12:00:00Z'), new Date('2026-12-01'));
    expect(data.totals.refills).toBe(2); expect(data.totals.returnRate).toBe(0); expect(data.asOf).toBe('2026-11-14T12:00:00.000Z');
  });
  it('exporta só as colunas autorizadas, versão derivada e UTC', () => {
    const csv = recordsCsv(rows); expect(csv).toContain('token_hash,curso,quantidade_litros,created_at,versao');
    expect(csv).toContain('"2026-11-13T12:00:00.000Z","A"'); expect(csv).toContain('"2.00"');
    expect(csv).not.toContain('submissionId'); expect(csv).not.toContain('cookie');
    expect(recordsCsv([{ ...rows[0], curso: '=HYPERLINK("evil")' }])).toContain("'=HYPERLINK");
  });
  it('semanas começam à segunda-feira UTC, incluindo passagem do ano', () => { expect(weekKey(new Date('2027-01-01'))).toBe('2026-12-28'); });
  it('não inventa utilizadores ou médias na ausência de dados', () => { const data = calculateMetrics([], new Date('2026-11-13'), new Date('2026-12-04')); expect(data.totals.participants).toBe(0); expect(data.totals.meanRefills).toBe(0); expect(data.daily).toEqual([]); });
  it('agrupa licenciatura, mestrado e doutoramento pelo nome base do curso', () => {
    const groupedRows: ResearchRow[] = [
      { token_hash: A, curso: 'Engenharia Informática', quantidade_litros: 1, created_at: new Date('2026-11-13T12:00:00Z') },
      { token_hash: B, curso: 'Mestrado em Engenharia Informática', quantidade_litros: 2, created_at: new Date('2026-11-13T13:00:00Z') },
      { token_hash: '02'.padEnd(64, '2'), curso: 'Doutoramento em Engenharia Informática', quantidade_litros: 3, created_at: new Date('2026-11-13T14:00:00Z') },
    ];
    expect(courseFamily('Mestrado em Engenharia Informática')).toBe('Engenharia Informática');
    expect(courseFamily('Doutoramento em Engenharia Informática')).toBe('Engenharia Informática');
    const data = calculateMetrics(groupedRows, new Date('2026-11-13'), new Date('2026-12-04'), new Date('2026-11-15'));
    expect(data.league).toHaveLength(1);
    expect(data.league[0]).toMatchObject({ course: 'Engenharia Informática', participants: 3, refills: 3, liters: 6 });
  });
});
