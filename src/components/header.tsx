'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChartNoAxesCombined, Droplets, Leaf, ShieldCheck } from 'lucide-react';
export function Brand() { return <span className="brand"><span className="brand-mark"><Droplets size={22} strokeWidth={1.7} aria-hidden="true" /></span>revira<span>Volta</span><span className="brand-dot" aria-hidden="true">.</span></span>; }
export function Header() {
  const path = usePathname();
  const links = [
    { href: '/', label: 'Encher', Icon: Droplets },
    { href: '/impacto', label: 'O meu impacto', Icon: ChartNoAxesCombined },
    { href: '/sobre', label: 'O projeto', Icon: Leaf },
  ];
  return <header className="site-header"><div className="header-inner"><Link href="/" aria-label="reviraVolta, página inicial"><Brand /></Link><nav className="main-nav" aria-label="Navegação principal">{links.map(({ href, label, Icon }) => <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}><Icon size={21} strokeWidth={1.7} aria-hidden="true"/><span>{label}</span></Link>)}</nav><Link className="header-link" href="/privacidade"><ShieldCheck size={17} aria-hidden="true"/> Privacidade</Link></div></header>;
}
