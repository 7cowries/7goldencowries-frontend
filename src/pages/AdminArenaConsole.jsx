import React, { useState } from 'react';
import Page from '../components/Page';
import { getJSON, postJSON } from '../utils/api';

export default function AdminArenaConsole() {
  const [arenaId, setArenaId] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  async function run(label, task) {
    setLoading(true);
    try {
      const res = await task();
      setOutput(`${label}\n${JSON.stringify(res, null, 2)}`);
    } catch (err) {
      setOutput(`${label}\nERROR: ${err?.message || 'Request failed'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <div className="glass-strong" style={{ padding: 20 }}>
        <h1>Admin Arena Console</h1>
        <p className="muted">Operational controls for arenas, payouts, payments, webhooks, and sponsor reviews.</p>

        <input
          value={arenaId}
          onChange={(e) => setArenaId(e.target.value)}
          placeholder="Arena ID"
          style={{ marginBottom: 10 }}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button className="btn" disabled={loading || !arenaId} onClick={() => run('Start Arena', () => postJSON(`/api/admin/arenas/${arenaId}/start`, {}))}>Start</button>
          <button className="btn" disabled={loading || !arenaId} onClick={() => run('End Arena', () => postJSON(`/api/admin/arenas/${arenaId}/end`, {}))}>End</button>
          <button className="btn" disabled={loading || !arenaId} onClick={() => run('Settle Arena', () => postJSON(`/api/admin/arenas/${arenaId}/settle`, {}))}>Settle</button>
          <button className="btn ghost" disabled={loading || !arenaId} onClick={() => run('Participants', () => getJSON(`/api/admin/arenas/${arenaId}/participants`))}>Participants</button>
          <button className="btn ghost" disabled={loading} onClick={() => run('Payments', () => getJSON('/api/admin/payments'))}>Payments</button>
          <button className="btn ghost" disabled={loading} onClick={() => run('Webhooks', () => getJSON('/api/admin/webhooks'))}>Webhooks</button>
          <button className="btn ghost" disabled={loading} onClick={() => run('Reward Payouts', () => getJSON('/api/admin/reward-payouts'))}>Reward Payouts</button>
          <button className="btn ghost" disabled={loading} onClick={() => run('Sponsor Applications', () => getJSON('/api/admin/sponsor-applications'))}>Sponsor Apps</button>
        </div>

        <pre className="glass" style={{ marginTop: 12, padding: 12, whiteSpace: 'pre-wrap' }}>{output || 'No action yet.'}</pre>
      </div>
    </Page>
  );
}
