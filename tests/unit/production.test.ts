import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/session/route';
import { settings } from '@/lib/config';
afterEach(() => vi.unstubAllEnvs());
describe('configuração de produção e estudo', () => {
  it('resolve os domínios Vercel separadamente para produção e preview', () => {
    vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('APP_ORIGIN', ''); vi.stubEnv('VERCEL', '1');
    vi.stubEnv('VERCEL_ENV', 'production'); vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'campus.vercel.app');
    vi.stubEnv('VERCEL_URL', 'campus-preview.vercel.app');
    expect(settings().origin).toBe('https://campus.vercel.app');
    vi.stubEnv('VERCEL_ENV', 'preview'); expect(settings().origin).toBe('https://campus-preview.vercel.app');
    vi.stubEnv('APP_ORIGIN', 'https://campus.example'); expect(settings().origin).toBe('https://campus.example');
  });
  it('ativa Secure e o prefixo __Host em produção', async () => {
    vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('APP_ORIGIN', 'https://campus.example');
    const response = await POST(new NextRequest('https://campus.example/api/session', { method: 'POST', headers: { Origin: 'https://campus.example', 'Content-Type': 'application/json' } }));
    expect(response.status).toBe(200); const cookie = response.headers.get('set-cookie')!;
    expect(cookie).toContain('__Host-rv-participant='); expect(cookie).toContain('Secure'); expect(cookie).toContain('HttpOnly'); expect(cookie).not.toContain('Domain=');
  });
  it('recusa produção HTTP e estudo sem responsável e fundamento', () => {
    vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('APP_ORIGIN', 'http://localhost:3000'); expect(() => settings()).toThrow('HTTPS');
    vi.stubEnv('APP_ORIGIN', 'https://campus.example'); vi.stubEnv('DATA_MODE', 'study'); vi.stubEnv('PROJECT_CONTACT', ''); expect(() => settings()).toThrow('responsável');
  });
  it('não transforma uma base de demonstração em evidência de estudo', () => {
    vi.stubEnv('DATA_MODE', 'study'); vi.stubEnv('DATABASE_URL', 'postgresql://localhost/reviravolta_demo'); expect(() => settings()).toThrow('demonstração');
  });
});
