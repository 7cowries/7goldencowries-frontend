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

  useEffect(() => {
    if (!paymentId || !arenaId) {
      setError('Missing payment reference');
      return;
    }

    let active = true;
    let timer = null;

    const poll = async () => {
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
        <h1>Verifying payment…</h1>
        <p className="muted">Payment status: {status}</p>
        {!!error && <p style={{ color: '#ff9b9b' }}>{error}</p>}
        <Link className="btn ghost" to={arenaId ? `/arenas/${arenaId}` : '/arenas'}>Back</Link>
      </div>
    </Page>
  );
}
