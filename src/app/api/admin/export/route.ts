import { NextRequest } from 'next/server';
import { handled } from '@/lib/http';
import { requireAdmin } from '@/lib/admin-guard';
import { researchSnapshot } from '@/lib/research';
import { recordsCsv } from '@/lib/metrics';
export async function GET(request: NextRequest) {
  return handled(async () => {
    requireAdmin(request);
    const { records, metrics } = await researchSnapshot();
    return new Response(recordsCsv(records), { headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="reviravolta-${metrics.dataMode}-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff',
    } });
  });
}
