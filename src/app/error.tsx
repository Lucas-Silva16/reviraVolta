'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="page-width empty-state"><h1>Esta volta ficou a meio.</h1><p>Não foi possível carregar a página. Tenta novamente dentro de instantes.</p><button className="button primary" onClick={reset}>Tentar novamente</button></div>; }
