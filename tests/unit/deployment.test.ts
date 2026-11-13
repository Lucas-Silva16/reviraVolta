import { describe, expect, it } from 'vitest';
import { deploymentErrors } from '../../scripts/deploy-config';

const valid = () => ({
  APP_ORIGIN: 'https://campus.example',
  DATABASE_URL: 'postgresql://app:password@db.example/campus?sslmode=verify-full',
  RESEARCH_DATABASE_URL: 'postgresql://reader:password@db.example/campus?sslmode=verify-full',
  TOKEN_HMAC_SECRET: 'a'.repeat(64), SESSION_SECRET: 'b'.repeat(64), CRON_SECRET: 'c'.repeat(64),
  ADMIN_USERNAME: 'docente', ADMIN_PASSWORD_HASH: `scrypt:${'a'.repeat(32)}:${'b'.repeat(128)}`,
});

describe('preparação Vercel', () => {
  it('aceita uma configuração externa com TLS, papéis e segredos separados', () => {
    expect(deploymentErrors(valid())).toEqual([]);
  });
  it('recusa origens inseguras e ligações locais sem expor credenciais', () => {
    const errors = deploymentErrors({ ...valid(), APP_ORIGIN: 'http://campus.example', DATABASE_URL: 'postgresql://owner:do-not-print-this@localhost/campus' });
    expect(errors.some(e => e.includes('HTTPS'))).toBe(true);
    expect(errors.some(e => e.includes('DATABASE_URL'))).toBe(true);
    expect(errors.join()).not.toContain('do-not-print-this');
  });
  it('exige validação TLS e utilizadores distintos', () => {
    const errors = deploymentErrors({ ...valid(), DATABASE_URL: 'postgresql://reader:password@db.example/campus?sslmode=disable' });
    expect(errors.some(e => e.includes('verify-full'))).toBe(true);
    expect(errors.some(e => e.includes('papéis diferentes'))).toBe(true);
  });
  it('recusa segredos repetidos ou cron sem segredo', () => {
    const errors = deploymentErrors({ ...valid(), SESSION_SECRET: 'a'.repeat(64), CRON_SECRET: '' });
    expect(errors.some(e => e.includes('diferentes'))).toBe(true);
    expect(errors.some(e => e.includes('CRON_SECRET'))).toBe(true);
  });
  it('usa as variáveis Vercel quando a origem não está definida e recusa estudo em preview', () => {
    expect(deploymentErrors({ ...valid(), APP_ORIGIN: '', VERCEL: '1', VERCEL_ENV: 'production', VERCEL_PROJECT_PRODUCTION_URL: 'campus.vercel.app' })).toEqual([]);
    const errors = deploymentErrors({ ...valid(), APP_ORIGIN: '', VERCEL: '1', VERCEL_ENV: 'preview', VERCEL_URL: 'campus-preview.vercel.app', DATA_MODE: 'study' });
    expect(errors).toHaveLength(1); expect(errors[0]).toContain('Previews');
  });
});
