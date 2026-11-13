import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { passwordHash } from './password.mjs';
if (existsSync('.env')) {
  console.log('.env já existe; não foi alterado.');
  process.exit(0);
}
const secret = () => randomBytes(32).toString('hex');
const owner = secret(), app = secret(), reader = secret(), password = randomBytes(24).toString('base64url');
const start = new Date(); start.setUTCHours(0, 0, 0, 0);
const end = new Date(start.getTime() + 21 * 86400000);
const values = {
  POSTGRES_PASSWORD: owner,
  MIGRATION_DATABASE_URL: `postgresql://reviravolta_owner:${owner}@localhost:5432/reviravolta`,
  DATABASE_URL: `postgresql://reviravolta_app:${app}@localhost:5432/reviravolta`,
  RESEARCH_DATABASE_URL: `postgresql://reviravolta_reader:${reader}@localhost:5432/reviravolta`,
  APP_DB_PASSWORD: app, READER_DB_PASSWORD: reader,
  TOKEN_HMAC_SECRET: secret(), SESSION_SECRET: secret(), CRON_SECRET: secret(), ADMIN_PASSWORD_HASH: passwordHash(password),
  STUDY_START: start.toISOString(), STUDY_END: end.toISOString(),
};
let env = readFileSync('.env.example', 'utf8');
for (const [key, value] of Object.entries(values)) env = env.replace(new RegExp(`^${key}=.*$`, 'm'), `${key}='${value}'`);
writeFileSync('.env', env, { flag: 'wx', mode: 0o600 });
mkdirSync('.local', { recursive: true });
writeFileSync('.local/docente.txt', `Acesso local do docente\nUtilizador: docente\nPalavra-passe: ${password}\n\nGuarde num gestor de palavras-passe e elimine este ficheiro antes do deploy.\n`, { mode: 0o600 });
console.log('.env criado com segredos aleatórios. Credenciais locais em .local/docente.txt (ignorado pelo Git).');
