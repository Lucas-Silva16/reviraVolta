'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Droplets, LockKeyhole, RotateCcw } from 'lucide-react';
import { COURSE_GROUPS, COURSES, VOLUMES } from '@/lib/config';
import { api, mutation, useSession } from './session';
import type { Impact } from '@/lib/refills';
import { newSubmissionId } from '@/lib/submission-id';
import { number, money } from '@/lib/format';
export function RefillForm() {
  const { csrf, error: sessionError, retry } = useSession();
  const [course, setCourse] = useState(''), [volume, setVolume] = useState<number | 'custom'>(0.5), [custom, setCustom] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [success, setSuccess] = useState<{ liters: number; total: number; euros: number; replayed: boolean } | null>(null);
  const pending = useRef<{ id: string; course: string; liters: number } | null>(null);
  const lock = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (csrf) api<Impact>('/api/impacto').then(data => { const previous = data.course; if (previous && COURSES.includes(previous)) setCourse(current => current || previous); }).catch(() => {}); }, [csrf]);
  useEffect(() => { if (success) successRef.current?.focus(); }, [success]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (lock.current) return;
    const liters = volume === 'custom' ? Number(custom.replace(',', '.')) : volume;
    if (!course) { setError('Escolhe o teu curso, Docente ou Funcionário para continuar.'); return; }
    if (!Number.isFinite(liters) || liters < 0.1 || liters > 5 || Math.abs(liters * 100 - Math.round(liters * 100)) > 1e-8) { setError('Introduz um volume entre 0,10 e 5 L, com até duas casas decimais.'); return; }
    if (!pending.current || pending.current.course !== course || pending.current.liters !== liters) pending.current = { id: newSubmissionId(), course, liters };
    lock.current = true; setBusy(true); setError('');
    try {
      const result = await api<{ replayed: boolean }>('/api/enchimentos', mutation(csrf, { curso: course, litros: liters, submissionId: pending.current.id }));
      // Um erro ao obter o impacto não deve esconder uma gravação confirmada.
      const impact = await api<Impact>('/api/impacto').catch(() => null);
      setSuccess({ liters, total: impact?.totalLiters ?? liters, euros: impact?.estimatedEuros ?? -1, replayed: result.replayed }); pending.current = null;
    } catch (err) { setError(err instanceof Error ? err.message : 'Tenta novamente.'); }
    finally { lock.current = false; setBusy(false); }
  }
  if (success) return <div className="refill-card success-card" ref={successRef} tabIndex={-1} role="status"><span className="success-icon"><Check size={30} /></span><span className="eyebrow">MAIS UMA VOLTA</span><h2>{number(success.liters)} L registados.</h2><p>{success.replayed ? 'Este enchimento já estava guardado. Foi contado uma única vez.' : 'O teu enchimento ficou guardado. Obrigado por dares outra volta à tua garrafa.'}</p>{success.euros >= 0 && <div className="success-totals"><div><strong>{number(success.total)} L</strong><span>no teu percurso</span></div><div><strong>{money(success.euros)}</strong><span>poupança estimada</span></div></div>}<Link href="/impacto" className="button primary">Ver o meu impacto <ArrowRight size={18}/></Link><button className="text-button" onClick={() => setSuccess(null)}><RotateCcw size={16}/> Registar outro enchimento</button></div>;
  return <form className="refill-card" onSubmit={submit} aria-label="Registar enchimento">
    <div className="form-heading"><span className="icon-square"><Droplets size={22} aria-hidden="true"/></span><div><h2>Registar enchimento</h2><p className="form-intro">Sem conta. Ao teu ritmo.</p></div></div>
    <div className="field-block">
      <label htmlFor="course"><span className="step-circle">1</span> Curso ou ligação à UMa</label>
      <select id="course" required value={course} onChange={e => setCourse(e.target.value)} disabled={busy} aria-describedby="course-hint">
        <option value="" disabled>Seleciona uma opção</option>
        {COURSE_GROUPS.map(group => <optgroup key={group.label} label={group.label}>
          {group.courses.map(c => <option key={c} value={c}>{c}</option>)}
        </optgroup>)}
      </select>
      <p id="course-hint" className="fine-print">Docentes e funcionários: opções no início da lista.</p>
    </div>
    <fieldset disabled={busy} className="field-block"><legend><span className="step-circle">2</span> Quanta água encheste?</legend><div className="volume-grid">{VOLUMES.map(v => <label key={v} className={`volume-option ${volume === v ? 'selected' : ''}`}><input type="radio" name="volume" value={v} checked={volume === v} onChange={() => setVolume(v)}/><span>{number(v)} <small>L</small></span>{volume === v && <Check size={13} aria-hidden="true"/>}</label>)}</div><label className="custom-toggle"><input type="radio" name="volume" checked={volume === 'custom'} onChange={() => setVolume('custom')}/> Outra quantidade</label>{volume === 'custom' && <div className="custom-volume"><label htmlFor="custom">Volume em litros (0,10 a 5 L)</label><input id="custom" type="text" inputMode="decimal" placeholder="Por exemplo, 0,65" value={custom} onChange={e => setCustom(e.target.value)} required maxLength={5}/></div>}</fieldset>
    {(error || sessionError) && <div className="error-message" role="alert">{error || sessionError}{sessionError && <button type="button" onClick={retry}>Tentar novamente</button>}</div>}
    <button type="submit" className="button primary full" disabled={busy || !csrf}>{busy ? 'A guardar o teu enchimento…' : !csrf && !sessionError ? 'A preparar…' : 'Registar enchimento'}<ArrowRight size={18} aria-hidden="true"/></button>
    <p className="privacy-note"><LockKeyhole size={15} aria-hidden="true"/><span>Sem pedir o teu nome. Guardamos a opção escolhida, os litros e a data. Um código neste navegador liga os teus registos. <Link href="/privacidade">Privacidade</Link>.</span></p>
  </form>;
}
