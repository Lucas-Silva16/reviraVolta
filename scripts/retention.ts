import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
const all = process.argv.includes('--all');
if (all && !process.argv.includes('--confirm-project-end')) throw new Error('Para eliminar tudo use --all --confirm-project-end. Não existe recuperação pela aplicação.');
const days = Number(process.env.RETENTION_DAYS || 90);
if (!Number.isInteger(days) || days < 1 || days > 365) throw new Error('RETENTION_DAYS inválido.');
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }), log: [] });
try {
  const cutoff = new Date(Date.now() - days * 86400000);
  const result = await prisma.enchimento.deleteMany({ where: all ? {} : { created_at: { lt: cutoff } } });
  console.log(`${result.count} registos eliminados (${all ? 'fim do projeto' : 'retenção'}). Elimine separadamente exportações e backups segundo a política aprovada.`);
} catch { console.error('A eliminação falhou. Verifique a ligação e as permissões da base de dados.'); process.exitCode = 1; }
finally { await prisma.$disconnect(); }
