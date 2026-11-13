import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { settings } from './config';
import { csrfFor, equal, tokenHash, validToken } from './crypto';
import { AppError } from './errors';
export const participantCookie = () => settings().production ? '__Host-rv-participant' : 'rv-participant';
export const adminCookie = () => settings().production ? '__Host-rv-docente' : 'rv-docente';
export function cookieOptions(maxAge: number) {
  return { httpOnly: true, secure: settings().production, sameSite: 'strict' as const, path: '/', maxAge };
}
export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'private, no-store', 'Vary': 'Cookie', 'X-Content-Type-Options': 'nosniff' } });
}
export function originGuard(request: NextRequest) {
  if (request.headers.get('origin') !== settings().origin || request.headers.get('sec-fetch-site') === 'cross-site') throw new AppError(403, 'Origem do pedido não autorizada.');
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new AppError(415, 'Envie dados em JSON.');
}
export function participant(request: NextRequest) {
  const token = request.cookies.get(participantCookie())?.value;
  if (!validToken(token)) throw new AppError(401, 'O identificador expirou. Atualiza a página para continuar.');
  return { token, hash: tokenHash(token) };
}
export function mutationGuard(request: NextRequest) {
  originGuard(request);
  const identity = participant(request);
  if (!equal(request.headers.get('x-csrf-token') || '', csrfFor(identity.token))) throw new AppError(403, 'Pedido expirado. Atualiza a página e tenta novamente.');
  return identity;
}
export async function readJson(request: NextRequest): Promise<unknown> {
  if (Number(request.headers.get('content-length') || 0) > 4096) throw new AppError(413, 'Pedido demasiado grande.');
  const stream = request.body?.getReader();
  if (!stream) throw new AppError(400, 'Pedido vazio.');
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { done, value } = await stream.read(); if (done) break;
    size += value.length;
    if (size > 4096) { await stream.cancel(); throw new AppError(413, 'Pedido demasiado grande.'); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new AppError(400, 'JSON inválido.'); }
}
export async function handled(run: () => Promise<Response>): Promise<Response> {
  try { return await run(); } catch (error) {
    if (error instanceof AppError) return json({ error: error.message }, error.status);
    if (error instanceof ZodError) return json({ error: error.issues[0]?.message || 'Dados inválidos.' }, 400);
    // Não registar objetos de erro, pedidos, parâmetros SQL, headers ou cookies.
    console.error('[reviraVolta] operação indisponível');
    return json({ error: 'Não foi possível concluir. Tenta novamente dentro de instantes.' }, 503);
  }
}
