import 'server-only';
import { reader } from './db';
import { courseFamily, retainedSince, settings } from './config';
import { variantFor } from './crypto';
import { calculateMetrics, type ResearchRow } from './metrics';
export async function researchSnapshot() {
  const cfg = settings();
  const start = new Date(Math.max(+cfg.start, +retainedSince()));
  return reader().$transaction(async tx => {
    await tx.$executeRaw`SET TRANSACTION READ ONLY`;
    const rows = await tx.enchimento.findMany({ where: { created_at: { gte: start, lt: cfg.end } }, orderBy: [{ created_at: 'asc' }, { id: 'asc' }] });
    const [distinct] = await tx.$queryRaw<{ count: bigint }[]>`SELECT COUNT(DISTINCT token_hash) AS count FROM enchimentos WHERE created_at >= ${start} AND created_at < ${cfg.end}`;
    const records: ResearchRow[] = rows.map(r => ({ token_hash: r.token_hash, curso: r.curso, quantidade_litros: Number(r.quantidade_litros), created_at: r.created_at }));
    const metrics = calculateMetrics(records, start, cfg.end);
    return {
      records,
      metrics: { ...metrics, distinctFromDatabase: Number(distinct.count), dataMode: cfg.dataMode, configuredStart: cfg.start.toISOString(), retentionTruncated: start > cfg.start,
        league: metrics.league.filter(r => r.participants >= cfg.minParticipants),
        minimum: cfg.minParticipants, recruitmentAttestation: cfg.recruitment || null,
        generatedAt: new Date().toISOString(),
        // Registo cronológico (mais recente primeiro) para o docente; sem token_hash.
        log: records.map(r => ({ at: r.created_at.toISOString(), curso: r.curso, family: courseFamily(r.curso), liters: r.quantidade_litros, group: variantFor(r.token_hash) })).reverse(),
      },
    };
  }, { isolationLevel: 'RepeatableRead', timeout: 15000 });
}
export type ResearchMetrics = Awaited<ReturnType<typeof researchSnapshot>>['metrics'];
