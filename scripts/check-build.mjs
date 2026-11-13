import 'dotenv/config';
import { existsSync, readdirSync, readFileSync, unlinkSync } from 'node:fs';
import { resolve, join, sep } from 'node:path';
// Next standalone pode copiar .env. O artefacto distribuível não deve conter segredos locais.
const workspace = resolve('.'), standalone = resolve('.next/standalone');
if (!standalone.startsWith(workspace + sep)) throw new Error('Diretório de build fora do projeto.');
if (existsSync(standalone)) {
  for (const entry of readdirSync(standalone, { withFileTypes: true })) {
    if ((entry.isFile() || entry.isSymbolicLink()) && (entry.name === '.env' || entry.name.startsWith('.env.'))) unlinkSync(join(standalone, entry.name));
  }
}
const keys = ['TOKEN_HMAC_SECRET', 'SESSION_SECRET', 'CRON_SECRET', 'ADMIN_PASSWORD_HASH', 'DATABASE_URL', 'RESEARCH_DATABASE_URL', 'MIGRATION_DATABASE_URL', 'POSTGRES_PASSWORD', 'APP_DB_PASSWORD', 'READER_DB_PASSWORD'];
const secrets = keys.map(key => process.env[key]).filter(value => value && value.length >= 16);
function check(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) check(path);
    else if (/\.(js|json|map|css)$/.test(entry.name)) {
      const contents = readFileSync(path, 'utf8');
      if (secrets.some(secret => contents.includes(secret))) throw new Error('Um segredo foi encontrado no bundle público. Não distribuir este build.');
    }
  }
}
check(resolve('.next/static'));
console.log('Build verificado: sem ficheiros .env no standalone nem valores de segredos no bundle público. Configure segredos apenas no runtime.');
