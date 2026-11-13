import { ArrowDown, BottleWine, ScanLine, Sprout } from 'lucide-react';
import { BottleArt } from '@/components/bottle-art';
import { RefillForm } from '@/components/refill-form';

const steps = [
  { Icon: BottleWine, title: 'Enche a tua garrafa', text: 'Usa um enchedor do campus e a tua garrafa reutilizável.' },
  { Icon: ScanLine, title: 'Regista o teu gesto', text: 'Escolhe o curso ou a tua ligação à UMa e a quantidade de água.' },
  { Icon: Sprout, title: 'Acompanha o teu percurso', text: 'Vê os teus litros e, se quiseres, define uma meta pessoal.' },
];

export default function Home() {
  return <>
    <section className="home-hero page-width">
      <div className="hero-copy">
        <span className="eyebrow"><span className="status-dot"/> CADA ENCHIMENTO É UM RECOMEÇO</span>
        <h1>Enche a tua garrafa.<br/><span>Faz a diferença.</span></h1>
        <p className="hero-description">Regista a água. Acompanha as tuas voltas.</p>
        <div className="hero-extra">
          <BottleArt/>
          <a className="how-link" href="#como-funciona">Como funciona <ArrowDown size={16}/></a>
        </div>
      </div>
      <div className="hero-form"><RefillForm/></div>
    </section>
    <section className="how-section" id="como-funciona">
      <div className="page-width">
        <div className="section-heading"><span className="eyebrow">COMO FUNCIONA</span><h2>Três passos. Muitas voltas.</h2></div>
        <div className="how-grid">{steps.map(({ Icon, title, text }) => <article key={title}>
          <span className="how-icon"><Icon size={23} strokeWidth={1.6} aria-hidden="true"/></span>
          <div><h3>{title}</h3><p>{text}</p></div>
        </article>)}</div>
      </div>
    </section>
  </>;
}