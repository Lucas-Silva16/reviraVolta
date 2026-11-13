import { describe, expect, it } from 'vitest';
import { refillSchema, deletionSchema } from '@/lib/validation';
const base = { curso: 'Engenharia Informática', litros: 0.5, submissionId: crypto.randomUUID() };
describe('validação de enchimentos', () => {
  it.each([0.1, 0.33, 0.5, 0.75, 1, 1.5, 2, 5])('aceita %s L', litros => { expect(refillSchema.safeParse({ ...base, litros }).success).toBe(true); });
  it.each([0, -1, 5.01, 0.001, 0.333, NaN, Infinity, '0.5', null])('rejeita %s', litros => { expect(refillSchema.safeParse({ ...base, litros }).success).toBe(false); });
  it('rejeita cursos arbitrários, HTML, SQL e campos extra', () => {
    for (const curso of ['', '<script>alert(1)</script>', "'; DROP TABLE enchimentos; --"]) expect(refillSchema.safeParse({ ...base, curso }).success).toBe(false);
    expect(refillSchema.safeParse({ ...base, variant: 'B' }).success).toBe(false);
    expect(refillSchema.safeParse({ ...base, created_at: '2020-01-01' }).success).toBe(false);
  });
  it('exige confirmação explícita para apagar', () => { expect(deletionSchema.safeParse({ confirm: true }).success).toBe(false); expect(deletionSchema.safeParse({ confirm: 'ELIMINAR' }).success).toBe(true); });
});
