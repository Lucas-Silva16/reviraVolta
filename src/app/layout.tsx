import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Leaf } from 'lucide-react';
import { Header, Brand } from '@/components/header';
import { SessionProvider } from '@/components/session';
import { settings } from '@/lib/config';
import './globals.css';
export const dynamic = 'force-dynamic';
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#F5F6F2', colorScheme: 'light' };
export const metadata: Metadata = { title: { default: 'reviraVolta — Enche a tua garrafa. Faz a diferença.', template: '%s · reviraVolta' }, description: 'Dá outra volta à tua garrafa. Regista os teus enchimentos e acompanha o teu percurso de reutilização no campus.', robots: { index: false, follow: false } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cfg = settings();
  return <html lang="pt-PT"><body><a className="skip-link" href="#conteudo">Saltar para o conteúdo</a><SessionProvider><Header/>{cfg.dataMode !== 'study' && <div className="environment-banner">{cfg.dataMode === 'demo' ? 'DEMONSTRAÇÃO · pode conter dados fictícios' : 'Ambiente de desenvolvimento'} · não utilizar como evidência académica</div>}<main id="conteudo">{children}</main><footer className="site-footer"><div className="footer-top"><Link href="/"><Brand/></Link><p><Leaf size={15} aria-hidden="true"/> Pequenos gestos. Novas voltas.</p><div><Link href="/sobre">O projeto</Link><Link href="/privacidade">Privacidade</Link><Link href="/admin">Área do docente <ArrowUpRight size={13} aria-hidden="true"/></Link></div></div><div className="footer-bottom"><span>Um projeto universitário de Persuasive Computing.</span><span>Feito para reutilizar. Pensado para respeitar.</span></div></footer></SessionProvider></body></html>;
}
