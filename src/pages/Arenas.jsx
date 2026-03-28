import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Page from '../components/Page';
import { getArenas } from '../utils/api';

function fmtAmount(amount, currency) {
  if (amount == null) return 'Free';
  return `${amount} ${currency || ''}`.trim();
}

export default function Arenas() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [arenas, setArenas] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getArenas()
      .then((res) => {
        if (cancelled) return;
        const items = res?.arenas || res?.items || (Array.isArray(res) ? res : []);
        setArenas(items);
        setError('');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || 'Failed to load arenas');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => {
    const active = [];
    const upcoming = [];
    arenas.forEach((a) => {
      const status = String(a?.status || '').toLowerCase();
      if (status === 'live' || status === 'active') active.push(a);
      else upcoming.push(a);
    });
    return { active, upcoming };
  }, [arenas]);

  return (
    <Page>
      <div className="glass-strong" style={{ padding: 20 }}>
        <h1>Crowns Arena Lobby</h1>
        <p className="muted">Compete for arena XP, ranks, and rewards across timed events.</p>

        {loading && <p>Loading arenas…</p>}
        {!!error && <p style={{ color: '#ff9b9b' }}>{error}</p>}

        {!loading && !error && (
          <>
            <h3>Live Arenas</h3>
            {grouped.active.length === 0 && <p className="muted">No live arena right now.</p>}
            {grouped.active.map((arena) => (
              <div key={arena.id} className="glass" style={{ padding: 14, marginBottom: 10 }}>
                <h4>{arena.title}</h4>
                <p className="muted">{arena.description || 'Competitive arena challenge'}</p>
                <p>Entry: {fmtAmount(arena.entry_fee_amount, arena.entry_fee_currency)}</p>
                <p>Prize pool: {fmtAmount(arena.prize_pool_amount, arena.prize_pool_currency)}</p>
                <Link className="btn" to={`/arenas/${arena.id}`}>Open Arena</Link>
              </div>
            ))}

            <h3 style={{ marginTop: 18 }}>Upcoming Arenas</h3>
            {grouped.upcoming.length === 0 && <p className="muted">No upcoming arena published.</p>}
            {grouped.upcoming.map((arena) => (
              <div key={arena.id} className="glass" style={{ padding: 14, marginBottom: 10 }}>
                <h4>{arena.title}</h4>
                <p className="muted">{arena.description || 'Arena starts soon'}</p>
                <p>Status: {arena.status || 'upcoming'}</p>
                <Link className="btn ghost" to={`/arenas/${arena.id}`}>View Details</Link>
              </div>
            ))}
          </>
        )}
      </div>
    </Page>
  );
}
