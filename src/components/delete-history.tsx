'use client';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api, mutation, useSession } from './session';

export function DeleteHistory() {
  const { csrf, error: sessionError } = useSession();
  const [open, setOpen] = useState(false), [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState('');

  async function remove() {
    if (!confirm) return;
    setBusy(true);
    setError('');
    try {
      const result = await api<{ deleted: number }>('/api/historico', mutation(csrf, { confirm: 'ELIMINAR' }, 'DELETE'));
      const confirmation = result.deleted === 1 ? '1 registo eliminado' : result.deleted + ' registos eliminados';
      setMessage(confirmation + '. O teu histórico está vazio. Se voltares a participar neste navegador, continuarás na mesma versão da aplicação.');
      setOpen(false);
      setConfirm(false);
      try { localStorage.removeItem('rv-personal-goal'); } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível apagar o histórico. Tenta novamente.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="delete-card" aria-labelledby="delete-title">
      <h2 id="delete-title">Queres apagar o teu histórico?</h2>
      <p>Podes apagar todos os enchimentos registados neste navegador. A tua meta pessoal também será retirada. Depois de confirmares, não será possível recuperar estes registos.</p>
      {message && <p role="status" className="success-message">{message}</p>}
      {!open ? (
        <button className="button secondary" onClick={() => setOpen(true)} disabled={!csrf}>
          <Trash2 size={16} /> Eliminar o meu histórico
        </button>
      ) : (
        <div className="delete-confirm">
          <label>
            <input type="checkbox" checked={confirm} onChange={e => setConfirm(e.target.checked)} disabled={busy} />
            Compreendo que todos os meus registos serão eliminados.
          </label>
          <div>
            <button className="button danger" disabled={!confirm || busy} onClick={remove}>
              {busy ? 'A eliminar…' : 'Confirmar eliminação'}
            </button>
            <button className="button secondary" disabled={busy} onClick={() => { setOpen(false); setConfirm(false); }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
      {(error || sessionError) && <p role="alert" className="error-message">{error || sessionError}</p>}
      <p className="fine-print">Esta opção apaga o histórico que conseguimos reconhecer neste navegador. Se já apagaste os cookies ou mudaste de navegador, não conseguimos encontrar os registos anteriores. Apagar o histórico aqui não muda a versão da aplicação que te foi atribuída.</p>
    </section>
  );
}
