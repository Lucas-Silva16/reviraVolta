import courseGroups from '../../config/courses.json';
export const COURSE_GROUPS: readonly { label: string; courses: readonly string[] }[] = courseGroups;
export const COURSES: readonly string[] = COURSE_GROUPS.flatMap(group => group.courses);
export const VOLUMES = [0.33, 0.5, 0.75, 1, 1.5, 2] as const;
export const LIMITS = { minLiters: 0.1, maxLiters: 5, intervalSeconds: 45, perDay: 20, litersPerDay: 20 } as const;
export const HYPOTHESIS = 'Adicionar progresso coletivo por curso aumenta o número médio de enchimentos registados por participante durante o período de observação.';

function numberEnv(name: string, fallback: number, min: number, max: number) {
  const value = Number(process.env[name] || fallback);
  if (!Number.isFinite(value) || value < min || value > max) throw new Error(`Configuração inválida: ${name}`);
  return value;
}
export function settings() {
  const vercelHost = process.env.VERCEL === '1'
    ? (process.env.VERCEL_ENV === 'preview' ? process.env.VERCEL_URL : process.env.VERCEL_PROJECT_PRODUCTION_URL)
    : undefined;
  const origin = new URL(process.env.APP_ORIGIN || (vercelHost ? `https://${vercelHost}` : 'http://localhost:3000'));
  if (!['http:', 'https:'].includes(origin.protocol)) throw new Error('APP_ORIGIN deve usar HTTP ou HTTPS.');
  if (origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) throw new Error('APP_ORIGIN deve conter apenas a origem.');
  const production = process.env.NODE_ENV === 'production';
  if (production && origin.protocol !== 'https:') throw new Error('HTTPS é obrigatório em produção.');
  const dataMode = process.env.DATA_MODE || 'development';
  if (!['development', 'study', 'demo'].includes(dataMode)) throw new Error('DATA_MODE inválido.');
  if (dataMode === 'study') {
    for (const key of ['DATABASE_URL', 'RESEARCH_DATABASE_URL']) {
      const database = new URL(process.env[key] || 'postgresql://localhost/unconfigured').pathname;
      if (database.endsWith('_demo') || database.includes('_test_')) throw new Error('A base de demonstração/testes não pode ser usada como estudo.');
    }
  }
  const contact = process.env.PROJECT_CONTACT || '';
  const controller = process.env.PROJECT_CONTROLLER || '';
  const lawfulBasis = process.env.PROJECT_LAWFUL_BASIS || '';
  if (dataMode === 'study' && (!contact || !controller || !lawfulBasis)) throw new Error('Configure responsável, contacto e fundamento antes do estudo.');
  const start = new Date(process.env.STUDY_START || '2026-11-13T00:00:00.000Z');
  const end = new Date(process.env.STUDY_END || '2026-12-04T00:00:00.000Z');
  if (!Number.isFinite(+start) || !Number.isFinite(+end) || end <= start) throw new Error('Período do estudo inválido.');
  const retentionDays = numberEnv('RETENTION_DAYS', 90, 1, 365);
  return {
    origin: origin.origin, production, dataMode, contact, controller, lawfulBasis, start, end,
    retentionDays, cookieDays: numberEnv('COOKIE_MAX_AGE_DAYS', 90, 1, 365),
    price: numberEnv('REFERENCE_PRICE_PER_LITER', 0.8, 0, 100),
    courseGoal: numberEnv('COURSE_GOAL_LITERS', 500, 1, 1000000),
    minParticipants: numberEnv('MIN_COURSE_PARTICIPANTS', 5, 5, 1000),
    recruitment: process.env.RECRUITMENT_ATTESTATION || '',
  };
}
export function retainedSince(now = new Date()) {
  return new Date(now.getTime() - settings().retentionDays * 86400000);
}
