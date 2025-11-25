import React, { useEffect, useState } from 'react';
import PageContainer from '../components/ui/PageContainer';
import GlassCard from '../components/ui/GlassCard';
import ReferralRow from '../components/referrals/ReferralRow';
import { API_BASE } from '../config';

const ReferralPage = () => {
  const [code, setCode] = useState('COWRY-GOLD');
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/referrals`);
        if (res.ok) {
          const data = await res.json();
          setRows(data);
          return;
        }
      } catch (err) {
        console.warn('referrals fallback', err);
      }
      setRows([
        { user: 'GlowWhale', date: 'Today', status: 'ready' },
        { user: 'TideRunner', date: 'Yesterday', status: 'pending' },
      ]);
    }
    load();
  }, []);

  const claim = async (item) => {
    try {
      await fetch(`${API_BASE}/api/referrals/claim`, { method: 'POST', body: JSON.stringify({ user: item.user }) });
    } catch (err) {
      console.warn('claim fallback', err);
    }
  };

  return (
    <PageContainer>
      <GlassCard
        title="Referral Reef"
        subtitle="Gold neon referral code and glass list"
        actions={<button className="btn-primary" onClick={() => navigator.clipboard?.writeText(code)}>Copy</button>}
      >
        <div className="glass-panel" style={{ padding: 14 }}>
          <div className="glass-inner" style={{ alignItems: 'center' }}>
            <h3 style={{ letterSpacing: 2 }}>{code}</h3>
            <p className="small-label">Share this to earn ocean XP</p>
          </div>
        </div>
        <div className="table-scroll">
          <table className="table-glass">
            <thead>
              <tr>
                <th>User</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <ReferralRow key={row.user} item={row} onClaim={claim} />
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </PageContainer>
  );
};

export default ReferralPage;
