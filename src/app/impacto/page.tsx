import { ImpactDashboard } from '@/components/impact-dashboard';
export const metadata = { title: 'O meu impacto' };
export default function ImpactPage() { return <div className="page-width inner-page"><div className="page-heading"><span className="eyebrow">O TEU PERCURSO DE REUTILIZAÇÃO</span><h1>Pequenos gestos.<br/><span>Voltas que contam.</span></h1><p>Os teus registos tornam visível um hábito que cresce contigo.</p></div><ImpactDashboard/></div>; }
