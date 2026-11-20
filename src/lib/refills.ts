import 'server-only';
import { db } from './db';
import { LIMITS, retainedSince, settings, courseFamily, coursesInFamily } from './config';
import { submissionRecordId, variantFor } from './crypto';
import { AppError } from './errors';
import type { z } from 'zod';
import type { refillSchema } from './validation';

export async function saveRefill(hash: string, input: z.infer<typeof refillSchema>) {
  const id = submissionRecordId(hash, input.submissionId);
  const cfg = settings();
  return db().$transaction(async tx => {
    // O mesmo bloqueio protege registos e eliminações, inclusive entre instâncias.
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${hash}))::text`;
    const existing = await tx.enchimento.findUnique({ where: { id } });
    if (existing) {
      if (existing.curso !== input.curso || Number(existing.quantidade_litros) !== input.litros) throw new AppError(409, 'Esta submissão já foi usada. Atualiza a página.');
      return { id, replayed: true, litros: Number(existing.quantidade_litros), createdAt: existing.created_at.toISOString() };
    }
    const [clock] = await tx.$queryRaw<{ now: Date }[]>`SELECT clock_timestamp() AS now`;
    const now = clock.now;
    if (cfg.dataMode === 'study' && (now < cfg.start || now >= cfg.end)) throw new AppError(403, 'O período de recolha do estudo não está aberto.');
    const last = await tx.enchimento.findFirst({ where: { token_hash: hash }, orderBy: { created_at: 'desc' } });
    if (last && now.getTime() - last.created_at.getTime() < LIMITS.intervalSeconds * 1000) throw new AppError(429, 'Já registaste um enchimento há pouco. Aguarda 45 segundos antes de um novo registo.');
    const day = new Date(now); day.setUTCHours(0, 0, 0, 0);
    const daily = await tx.enchimento.aggregate({ where: { token_hash: hash, created_at: { gte: day } }, _count: true, _sum: { quantidade_litros: true } });
    if (daily._count >= LIMITS.perDay || Number(daily._sum.quantidade_litros || 0) + input.litros > LIMITS.litersPerDay) throw new AppError(429, 'Atingiste o limite diário de registos. Podes regressar amanhã.');
    const row = await tx.enchimento.create({ data: { id, token_hash: hash, curso: input.curso, quantidade_litros: input.litros, created_at: now } });
    return { id, replayed: false, litros: Number(row.quantidade_litros), createdAt: row.created_at.toISOString() };
  }, { timeout: 10000 });
}

export async function deleteHistory(hash: string) {
  return db().$transaction(async tx => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${hash}))::text`;
    return (await tx.enchimento.deleteMany({ where: { token_hash: hash } })).count;
  });
}

export async function individualImpact(hash: string) {
  const cfg = settings();
  const where = { token_hash: hash, created_at: { gte: retainedSince() } };
  const [totals, last] = await Promise.all([
    db().enchimento.aggregate({ where, _count: true, _sum: { quantidade_litros: true } }),
    db().enchimento.findFirst({ where, orderBy: { created_at: 'desc' }, select: { curso: true, created_at: true } }),
  ]);
  const variant = variantFor(hash);
  const totalLiters = Number(totals._sum.quantidade_litros || 0);
  const individual = { totalLiters, refills: totals._count, estimatedEuros: totalLiters * cfg.price, bottleEquivalents: totalLiters / 0.5, pricePerLiter: cfg.price, course: last?.curso ?? null, lastRefill: last?.created_at.toISOString() ?? null };
  if (variant === 'A') return { variant, ...individual };
  if (!last) return { variant, ...individual, collective: { visible: false as const, minimum: cfg.minParticipants } };
  const since = new Date(Math.max(+retainedSince(), cfg.dataMode === 'study' ? +cfg.start : 0));
  const until = cfg.dataMode === 'study' ? cfg.end : new Date();
  const course = courseFamily(last.curso);
  const familyCourses = coursesInFamily(course);
  const [result] = await db().$queryRaw<{ people: bigint; liters: number }[]>`
    SELECT COUNT(DISTINCT token_hash) AS people, COALESCE(SUM(quantidade_litros), 0)::float8 AS liters
    FROM enchimentos WHERE curso = ANY(${familyCourses}::text[]) AND created_at >= ${since} AND created_at < ${until}
    AND get_byte(decode(token_hash, 'hex'), 0) % 2 = 1`;
  if (Number(result.people) < cfg.minParticipants) return { variant, ...individual, collective: { visible: false as const, minimum: cfg.minParticipants } };
  // Intervalos de 5 L limitam a precisão pública. Não são garantia de anonimato.
  const liters = Math.floor(result.liters / 5) * 5;
  return { variant, ...individual, collective: { visible: true as const, course, liters, goal: cfg.courseGoal, minimum: cfg.minParticipants } };
}
export type Impact = Awaited<ReturnType<typeof individualImpact>>;
