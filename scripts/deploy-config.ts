export function deploymentErrors(env: Readonly<Record<string, string | undefined>>): string[] {
  const errors: string[] = [];
  const vercelHost = env.VERCEL === '1' ? (env.VERCEL_ENV === 'preview' ? env.VERCEL_URL : env.VERCEL_PROJECT_PRODUCTION_URL) : undefined;
  const origin = env.APP_ORIGIN || (vercelHost ? `https://${vercelHost}` : '');
  const localHost = (host: string) => host === 'localhost' || host.endsWith('.localhost') || host.startsWith('127.') || ['0.0.0.0', '[::1]'].includes(host);
  try {
    const url = new URL(origin);
    if (url.protocol !== 'https:' || localHost(url.hostname) || url.pathname !== '/' || url.search || url.hash || url.username || url.password) throw new Error();
  } catch { errors.push('Defina APP_ORIGIN com a origem HTTPS final, ou disponibilize as variáveis de domínio da Vercel.'); }

  const users: string[] = [];
  for (const name of ['DATABASE_URL', 'RESEARCH_DATABASE_URL']) {
    try {
      const url = new URL(env[name] || '');
      if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.username || !url.password || url.pathname.length < 2 || localHost(url.hostname) || /SUBSTITUIR/i.test(env[name] || '')) throw new Error();
      if (url.searchParams.get('sslmode') !== 'verify-full') errors.push(`${name}: use sslmode=verify-full para verificar o certificado PostgreSQL.`);
      users.push(decodeURIComponent(url.username));
    } catch { errors.push(`${name}: configure uma ligação PostgreSQL externa com utilizador, palavra-passe e base de dados.`); }
  }
  if (users.length === 2 && users[0] === users[1]) errors.push('DATABASE_URL e RESEARCH_DATABASE_URL devem usar papéis diferentes.');
  for (const name of ['TOKEN_HMAC_SECRET', 'SESSION_SECRET']) {
    if (!/^[a-f0-9]{64,}$/i.test(env[name] || '')) errors.push(`${name}: use pelo menos 32 bytes aleatórios em hexadecimal.`);
  }
  if (env.TOKEN_HMAC_SECRET && env.TOKEN_HMAC_SECRET === env.SESSION_SECRET) errors.push('TOKEN_HMAC_SECRET e SESSION_SECRET devem ser diferentes.');
  if (!/^[A-Za-z0-9_-]{32,256}$/.test(env.CRON_SECRET || '')) errors.push('CRON_SECRET: use um segredo aleatório de 32 a 256 caracteres, sem espaços.');
  if (env.CRON_SECRET && [env.SESSION_SECRET, env.TOKEN_HMAC_SECRET].includes(env.CRON_SECRET)) errors.push('CRON_SECRET deve ser independente dos outros segredos.');
  if (!env.ADMIN_USERNAME?.trim()) errors.push('ADMIN_USERNAME é obrigatório.');
  if (!/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(env.ADMIN_PASSWORD_HASH || '')) errors.push('ADMIN_PASSWORD_HASH: gere um hash scrypt com setup:vercel ou scripts/password.mjs.');
  if (env.VERCEL_ENV === 'preview' && env.DATA_MODE === 'study') errors.push('Previews não podem recolher dados em modo study; use uma base e segredos separados.');
  return errors;
}
