import { NextRequest } from 'next/server';
import { newToken, validToken, csrfFor } from '@/lib/crypto';
import { settings } from '@/lib/config';
import { cookieOptions, handled, json, originGuard, participantCookie } from '@/lib/http';
export async function POST(request: NextRequest) {
  return handled(async () => {
    originGuard(request);
    const existing = request.cookies.get(participantCookie())?.value;
    const token = validToken(existing) ? existing : newToken();
    const response = json({ csrf: csrfFor(token) });
    if (!validToken(existing)) response.cookies.set(participantCookie(), token, cookieOptions(settings().cookieDays * 86400));
    return response;
  });
}
