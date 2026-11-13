import { NextRequest } from 'next/server';
import { cookieOptions, handled, json, mutationGuard, readJson, adminCookie } from '@/lib/http';
import { createAdminSession, loginLimit, verifyCredentials } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { AppError } from '@/lib/errors';
export async function POST(request: NextRequest) {
  return handled(async () => {
    mutationGuard(request); await loginLimit();
    const body = loginSchema.parse(await readJson(request));
    if (!await verifyCredentials(body.username, body.password)) throw new AppError(401, 'Credenciais incorretas.');
    const response = json({ authenticated: true });
    response.cookies.set(adminCookie(), createAdminSession(), cookieOptions(4 * 3600));
    return response;
  });
}
