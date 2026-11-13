import { NextRequest, NextResponse } from 'next/server';
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const dev = process.env.NODE_ENV !== 'production';
  const csp = `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${dev ? "'unsafe-eval'" : ''}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' ${dev ? 'ws: wss:' : ''}; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; ${dev ? '' : 'upgrade-insecure-requests;'}`;
  const headers = new Headers(request.headers); headers.set('x-nonce', nonce); headers.set('Content-Security-Policy', csp);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=(), browsing-topics=()');
  response.headers.set('Cache-Control', 'private, no-store');
  if (!dev) response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)'] };
