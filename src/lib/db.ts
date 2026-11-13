import 'server-only';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';
const globalDb = globalThis as unknown as { rvDb?: PrismaClient; rvReader?: PrismaClient };
function client(connectionString: string | undefined) {
  if (!connectionString) throw new Error('Ligação à base de dados não configurada.');
  const pool = new Pool({ connectionString, max: 5, min: 0, connectionTimeoutMillis: 10000, idleTimeoutMillis: 5000 });
  // Não registar o erro pg: pode conter credenciais ou parâmetros SQL.
  pool.on('error', () => { console.error('[reviraVolta] ligação à base de dados indisponível'); });
  if (process.env.VERCEL === '1') attachDatabasePool(pool);
  return new PrismaClient({ adapter: new PrismaPg(pool, { disposeExternalPool: true }), log: [] });
}
export function db() { return globalDb.rvDb ??= client(process.env.DATABASE_URL); }
export function reader() {
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL === process.env.RESEARCH_DATABASE_URL) throw new Error('Use um utilizador PostgreSQL separado, apenas de leitura.');
  return globalDb.rvReader ??= client(process.env.RESEARCH_DATABASE_URL);
}
