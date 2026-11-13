import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { passwordHash } from './password.mjs';

const paths = ['.local/vercel.env', '.local/vercel-database.env', '.local/vercel-docente.txt'];
if (paths.some(path => existsSync(path))) {
  console.error('A preparação Vercel já existe em .local; não foram substituídos segredos ou ficheiros.');
  process.exit(1);
}
const secret = () => randomBytes(32).toString('hex');
const appPassword = secret(), readerPassword = secret(), password = randomBytes(24).toString('base64url');
const start = new Date(); start.setUTCHours(0, 0, 0, 0);
const end = new Date(+start + 21 * 86400000);
const values = {
  DATABASE_URL: `postgresql://reviravolta_app:${appPassword}@SUBSTITUIR_HOST_POOL:5432/SUBSTITUIR_BASE?sslmode=verify-full`,
  RESEARCH_DATABASE_URL: `postgresql://reviravolta_reader:${readerPassword}@SUBSTITUIR_HOST_POOL:5432/SUBSTITUIR_BASE?sslmode=verify-full`,
  TOKEN_HMAC_SECRET: secret(), SESSION_SECRET: secret(), CRON_SECRET: secret(),
  ADMIN_PASSWORD_HASH: passwordHash(password), STUDY_START: start.toISOString(), STUDY_END: end.toISOString(),
};
let env = readFileSync('.env.vercel.example', 'utf8');
for (const [key, value] of Object.entries(values)) env = env.replace(new RegExp(`^${key}=.*$`, 'm'), `${key}=${value}`);
mkdirSync('.local', { recursive: true });
writeFileSync(paths[0], env, { flag: 'wx', mode: 0o600 });
writeFileSync(paths[1], `# Usar apenas para migrações e papéis. NÃO importar este ficheiro na Vercel.\nMIGRATION_DATABASE_URL=postgresql://SUBSTITUIR_PROPRIETARIO:SUBSTITUIR_PASSWORD@SUBSTITUIR_HOST_DIRETO:5432/SUBSTITUIR_BASE?sslmode=verify-full\nAPP_DB_PASSWORD=${appPassword}\nREADER_DB_PASSWORD=${readerPassword}\n`, { flag: 'wx', mode: 0o600 });
writeFileSync(paths[2], `Credenciais próprias do deploy Vercel\nUtilizador: docente\nPalavra-passe: ${password}\n\nGuardar num gestor de palavras-passe. Não enviar este ficheiro para o alojamento.\n`, { flag: 'wx', mode: 0o600 });
console.log('Preparados .local/vercel.env, .local/vercel-database.env e .local/vercel-docente.txt. Segredos não apresentados.');
console.log('Preencha os endereços PostgreSQL externos antes de verificar ou importar a configuração.');
