import React, { useEffect, useState } from 'react';
import PageContainer from '../components/ui/PageContainer';
import GlassCard from '../components/ui/GlassCard';
import TierCardHybrid from '../components/ui/TierCardHybrid';
import { API_BASE } from '../config';

const SubscriptionPage = () => {
  const [tiers, setTiers] = useState([
    { name: 'Pearl', price: 12, perks: 'Starter ocean boosts' },
    { name: 'Coral', price: 24, perks: 'Quest priority + XP wave' },
    { name: 'Leviathan', price: 48, perks: 'Max boosts + staking perks' },
  ]);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/subscriptions/status`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (err) {
        console.warn('subscription status fallback', err);
      }
    }
    load();
  }, []);

  const subscribe = async (tier) => {
    try {
      await fetch(`${API_BASE}/subscriptions/subscribe`, { method: 'POST', body: JSON.stringify({ tier: tier.name }) });
      setStatus({ tier: tier.name, active: true });
    } catch (err) {
      console.warn('subscribe fallback', err);
    }
  };

  return (
    <PageContainer>
      <GlassCard title="Subscription Tiers" subtitle="Gold perimeter animation">
        <div className="card-grid">
          {tiers.map((tier) => (
            <TierCardHybrid key={tier.name} tier={tier} onSelect={subscribe} />
          ))}
        </div>
        {status && (
          <div className="pill" style={{ marginTop: 12 }}>
            Active: {status.tier}
          </div>
        )}
      </GlassCard>
    </PageContainer>
  );
};

export default SubscriptionPage;
