'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
type Session = { csrf: string; error: string; retry: () => void };
const Context = createContext<Session>({ csrf: '', error: '', retry: () => {} });
export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: 'no-store', ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Não foi possível concluir o pedido.');
  return data;
}
let initialization: Promise<{ csrf: string }> | null = null;
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [csrf, setCsrf] = useState(''), [error, setError] = useState('');
  const init = useCallback(() => {
    initialization ??= api<{ csrf: string }>('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    initialization.then(data => { setCsrf(data.csrf); setError(''); }).catch(err => { setError(err.message); initialization = null; });
  }, []);
  useEffect(() => { init(); }, [init]);
  return <Context.Provider value={{ csrf, error, retry: init }}>{children}</Context.Provider>;
}
export const useSession = () => useContext(Context);
export function mutation(csrf: string, body: unknown, method = 'POST'): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }, body: JSON.stringify(body) };
}
