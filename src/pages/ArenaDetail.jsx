import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Page from '../components/Page';
import {
  getArenaById,
  getArenaLeaderboard,
  getMyArenaState,
  initArenaEntryNomba,
  initArenaEntryTon,
  joinArena,
} from '../utils/api';

export default function ArenaDetail() {
  const { arenaId } = useParams();
  const [arena, setArena] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [me, setMe] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [arenaRes, leaderboardRes, meRes] = await Promise.all([
      getArenaById(arenaId),
      getArenaLeaderboard(arenaId),
      getMyArenaState(arenaId).catch(() => null),
    ]);

    setArena(arenaRes?.arena || arenaRes);
    setLeaderboard(leaderboardRes?.entries || leaderboardRes?.leaderboard || []);
    setMe(meRes?.participant || meRes || null);
  }, [arenaId]);

  useEffect(() => {
    load().catch((err) => setError(err?.message || 'Failed to load arena'));
  }, [load]);

  const startTonJoin = async () => {
    setBusy('ton');
    setError('');
    try {
      const init = await initArenaEntryTon(arenaId);
      if (init?.payment?.status === 'paid' || init?.status === 'paid') {
        await joinArena(arenaId, { paymentId: init?.payment?.id || init?.paymentId, provider: 'ton' });
      }
      await load();
    } catch (err) {
      setError(err?.message || 'TON join failed');
    } finally {
      setBusy('');
    }
  };

  const startNombaJoin = async () => {
    setBusy('nomba');
    setError('');
    try {
      const init = await initArenaEntryNomba(arenaId);
      const paymentId = init?.payment?.id || init?.paymentId;
      const checkoutUrl = init?.checkoutUrl || init?.payment?.checkout_url || init?.payment?.checkoutUrl;
      if (checkoutUrl && paymentId) {
        const returnUrl = `/arena-payment-status?paymentId=${encodeURIComponent(paymentId)}&arenaId=${encodeURIComponent(arenaId)}`;
        window.location.assign(`${checkoutUrl}${checkoutUrl.includes('?') ? '&' : '?'}returnUrl=${encodeURIComponent(window.location.origin + returnUrl)}`);
        return;
      }
      throw new Error('Unable to start Nomba checkout');
    } catch (err) {
      setError(err?.message || 'Nomba join failed');
      setBusy('');
    }
  };

  const topTen = useMemo(() => leaderboard.slice(0, 10), [leaderboard]);

  return (
    <Page>
      <div className="glass-strong" style={{ padding: 20 }}>
        <Link to="/arenas" className="btn ghost">← Back to Arena Lobby</Link>
        <h1>{arena?.title || 'Arena'}</h1>
        <p className="muted">{arena?.description || 'Arena details and rank board.'}</p>
        {!!error && <p style={{ color: '#ff9b9b' }}>{error}</p>}

        <div className="glass" style={{ padding: 12, marginBottom: 14 }}>
          <p>Status: {arena?.status || 'Unknown'}</p>
          <p>Entry fee: {arena?.entry_fee_amount ?? 0} {arena?.entry_fee_currency || 'TON'}</p>
          <p>Prize pool: {arena?.prize_pool_amount ?? 0} {arena?.prize_pool_currency || 'TON'}</p>
          <p>Scoring: {arena?.scoring_mode || 'xp'}</p>
          <p>Joined: {me ? 'Yes' : 'No'}</p>
          {me && <p>Your arena XP: {me?.arena_xp ?? me?.arenaXp ?? 0}</p>}
        </div>

        {!me && (
          <div className="glass" style={{ padding: 12, marginBottom: 14 }}>
            <h3>Join this arena</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn" onClick={startTonJoin} disabled={!!busy}>{busy === 'ton' ? 'Processing TON…' : 'Join with TON'}</button>
              <button className="btn ghost" onClick={startNombaJoin} disabled={!!busy}>{busy === 'nomba' ? 'Starting checkout…' : 'Join with Card/Bank (Nomba)'}</button>
            </div>
          </div>
        )}

        <div className="glass" style={{ padding: 12 }}>
          <h3>Leaderboard</h3>
          {topTen.length === 0 && <p className="muted">No entries yet.</p>}
          {topTen.map((entry, idx) => {
            const identity = entry?.wallet || entry?.user || entry?.username || `Player ${idx + 1}`;
            const xp = entry?.arena_xp ?? entry?.arenaXp ?? entry?.xp ?? 0;
            const mine = me && (me?.wallet === entry?.wallet || me?.user_id === entry?.user_id);
            return (
              <div key={`${identity}-${idx}`} className="glass" style={{ padding: 10, marginBottom: 8, border: mine ? '1px solid #f4d06f' : undefined }}>
                <strong>#{idx + 1}</strong> {identity} — {xp} XP
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 14 }}>
          <Link className="btn" to={`/quests?arenaId=${encodeURIComponent(arenaId)}`}>Play Arena Quests</Link>
        </div>
      </div>
    </Page>
  );
}
