import { config as loadEnv } from 'dotenv';
import { Pool } from 'pg';
import { checkDatabase } from './deploy-database';
import { deploymentErrors } from './deploy-config';
import { settings } from '../src/lib/config';

const fileIndex = process.argv.indexOf('--env-file');
if (fileIndex !== -1 && !process.argv[fileIndex + 1]) throw new Error('Indique o caminho depois de --env-file.');
const loaded = loadEnv({ path: fileIndex === -1 ? '.env' : process.argv[fileIndex + 1], quiet: true });
if (fileIndex !== -1 && loaded.error) throw new Error('Não foi possível ler o ficheiro de ambiente indicado.');
Object.assign(process.env, { NODE_ENV: 'production' });
const errors = deploymentErrors(process.env);
if (errors.length) {
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
try { settings(); } catch {
  console.error('Parâmetros de recolha inválidos: verifique datas, limites, DATA_MODE e dados do responsável.');
  process.exit(1);
}

const databases: string[] = [];
for (const name of ['DATABASE_URL', 'RESEARCH_DATABASE_URL'] as const) {
  const pool = new Pool({ connectionString: process.env[name], max: 1, connectionTimeoutMillis: 10000, statement_timeout: 10000 });
  pool.on('error', () => {});
  try {
    databases.push(await checkDatabase(pool, name === 'DATABASE_URL'));
    console.log(`${name}: ligação, migrações e permissões verificadas.`);
  } catch {
    console.error(`${name}: não foi possível confirmar a ligação, o esquema e as permissões mínimas. Execute as migrações e db:roles com a ligação direta do proprietário.`);
    process.exitCode = 1;
  } finally { await pool.end(); }
}
if (databases.length === 2 && databases[0] !== databases[1]) {
  console.error('As duas ligações devem apontar para a mesma base de dados.');
  process.exitCode = 1;
}
if (!process.exitCode) console.log('Preparação para deploy validada. Não foram alterados dados.');
