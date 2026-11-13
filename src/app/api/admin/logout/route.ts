import { NextRequest } from 'next/server';
import { cookieOptions, handled, json, mutationGuard, adminCookie } from '@/lib/http';
export async function POST(request: NextRequest) {
  return handled(async () => { mutationGuard(request); const response = json({ ok: true }); response.cookies.set(adminCookie(), '', cookieOptions(0)); return response; });
}
