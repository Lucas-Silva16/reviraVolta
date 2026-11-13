import 'dotenv/config';
import { randomBytes, randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { tokenHash } from '../src/lib/crypto';
const url = new URL(process.env.DATABASE_URL || 'postgresql://localhost/invalid');
if (process.env.NODE_ENV === 'production' || process.env.DATA_MODE !== 'demo' || !url.pathname.endsWith('_demo') || !['localhost', '127.0.0.1'].includes(url.hostname) || process.env.ALLOW_DEMO_SEED !== 'true') {
  throw new Error('Seed recusado: exige DATA_MODE=demo, ALLOW_DEMO_SEED=true, base local terminada em _demo e ambiente não produtivo. Nunca use a BD do estudo.');
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url.toString() }), log: [] });
try {
  if (await prisma.enchimento.count()) throw new Error('A base de demonstração deve estar vazia.');
  const rows = [];
  for (let i = 0; i < 12; i++) {
    const hash = tokenHash(randomBytes(32).toString('hex'));
    for (let j = 0; j < 3; j++) rows.push({ id: randomUUID(), token_hash: hash, curso: i % 2 ? 'Design' : 'Engenharia Informática', quantidade_litros: .5 + (i % 3) * .25, created_at: new Date(Date.now() - j * 86400000) });
  }
  await prisma.enchimento.createMany({ data: rows });
  console.log('36 REGISTOS FICTÍCIOS inseridos numa BD de DEMONSTRAÇÃO. NÃO SÃO EVIDÊNCIA ACADÉMICA.');
} finally { await prisma.$disconnect(); }
