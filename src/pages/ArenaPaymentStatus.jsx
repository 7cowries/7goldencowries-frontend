import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Page from '../components/Page';
import { getPaymentStatus, joinArena } from '../utils/api';

export default function ArenaPaymentStatus() {
  const [params] = useSearchParams();
  const paymentId = params.get('paymentId');
  const arenaId = params.get('arenaId');
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!paymentId || !arenaId) {
      setError('Missing payment reference');
      return;
    }

    let active = true;
    let timer = null;

    const poll = async () => {
      setChecking(true);
      try {
        const res = await getPaymentStatus(paymentId);
        const next = String(res?.status || res?.payment?.status || 'pending').toLowerCase();
        if (!active) return;

        setStatus(next);
        if (next === 'paid' || next === 'confirmed' || next === 'success') {
          await joinArena(arenaId, { paymentId, provider: 'nomba' });
          window.location.assign(`/arenas/${encodeURIComponent(arenaId)}`);
          return;
        }

        if (next === 'failed' || next === 'expired' || next === 'cancelled') {
          setError('Payment did not complete. Please retry.');
          return;
        }

        timer = setTimeout(poll, 3000);
      } catch (err) {
        if (!active) return;
        setError(err?.message || 'Unable to verify payment right now.');
      } finally {
        if (active) setChecking(false);
      }
    };

    poll();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [arenaId, paymentId]);

  return (
    <Page>
      <div className="glass-strong" style={{ padding: 20 }}>
        <h1>Arena payment status</h1>
        <p className="muted">
          {status === 'pending'
            ? 'We are waiting for your payment provider confirmation.'
            : `Current status: ${status}`}
        </p>
        {!!error && <p style={{ color: '#ff9b9b' }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => window.location.reload()} disabled={checking}>
            {checking ? 'Checking…' : 'Recheck status'}
          </button>
          <Link className="btn ghost" to={arenaId ? `/arenas/${arenaId}` : '/arenas'}>
            Back to arena
          </Link>
          <Link className="btn ghost" to="/arenas">
            Arena lobby
          </Link>
        </div>
      </div>
    </Page>
  );
}
