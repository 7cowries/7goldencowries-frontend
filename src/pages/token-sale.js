import React, { useEffect, useState } from 'react';
import PageContainer from '../components/ui/PageContainer';
import GlassCard from '../components/ui/GlassCard';
import XPBarWave from '../components/ui/XPBarWave';
import { API_BASE } from '../config';

const TokenSale = () => {
  const [stats, setStats] = useState({ raised: 0, goal: 100000 });
  const [ton, setTon] = useState('');
  const [usd, setUsd] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/token-sale/stats`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.warn('token-sale stats fallback', err);
        setStats({ raised: 42000, goal: 100000 });
      }
    }
    load();
  }, []);

  const convertTon = (value) => {
    setTon(value);
    setUsd((Number(value) * 2.3).toFixed(2));
  };

  const startSale = async () => {
    await fetch(`${API_BASE}/token-sale/start`, { method: 'POST' }).catch((err) => console.warn('start fallback', err));
  };

  const progress = Math.min((stats.raised / stats.goal) * 100, 100);

  return (
    <PageContainer>
      <GlassCard title="Token Sale" subtitle="Glowing TON panels & live progress">
        <div className="grid-responsive">
          <div className="glass-panel">
            <div className="glass-inner" style={{ gap: 10 }}>
              <h3>TON / USD Converter</h3>
              <label className="small-label">TON Amount</label>
              <input className="input-glass" value={ton} onChange={(e) => convertTon(e.target.value)} />
              <label className="small-label">USD</label>
              <input className="input-glass" value={usd} readOnly />
              <button className="btn-primary" onClick={startSale}>Start Purchase</button>
            </div>
          </div>
          <div className="glass-panel">
            <div className="glass-inner" style={{ gap: 8 }}>
              <h3>Live Progress</h3>
              <p className="small-label">Raised {stats.raised} / {stats.goal}</p>
              <XPBarWave progress={progress} />
            </div>
          </div>
        </div>
      </GlassCard>
    </PageContainer>
  );
};

export default TokenSale;
