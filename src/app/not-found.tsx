import Link from 'next/link';
export default function NotFound() { return <div className="page-width empty-state"><span className="eyebrow">404</span><h1>Vamos dar a volta?</h1><p>Esta página não existe.</p><Link className="button primary" href="/">Voltar ao início</Link></div>; }
