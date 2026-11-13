import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { equal } from '@/lib/crypto';
import { retainedSince } from '@/lib/config';
import { handled, json } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !equal(request.headers.get('authorization') || '', `Bearer ${secret}`)) {
    return json({ error: 'Não autorizado.' }, 401);
  }
  if (process.env.VERCEL_ENV === 'preview') return json({ error: 'Limpeza automática desativada em previews.' }, 403);
  return handled(async () => {
    const cutoff = retainedSince();
    const result = await db().$transaction(async tx => {
      const deleted = await tx.enchimento.deleteMany({ where: { created_at: { lt: cutoff } } });
      await tx.$executeRaw`UPDATE admin_login_throttle SET attempts = ARRAY(SELECT t FROM unnest(attempts) AS t WHERE t > clock_timestamp() - interval '15 minutes') WHERE id = 1`;
      return deleted;
    }, { timeout: 45000 });
    return json({ deleted: result.count });
  });
}

// Next faria HEAD através de GET por omissão; uma sondagem não deve eliminar dados.
export function HEAD() { return new Response(null, { status: 405, headers: { Allow: 'GET', 'Cache-Control': 'no-store' } }); }
