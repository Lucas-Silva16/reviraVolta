import 'server-only';
import type { NextRequest } from 'next/server';
import { adminCookie } from './http';
import { validAdminSession } from './auth';
import { AppError } from './errors';
export function requireAdmin(request: NextRequest) {
  if (!validAdminSession(request.cookies.get(adminCookie())?.value)) throw new AppError(401, 'Inicia sessão como docente.');
}
