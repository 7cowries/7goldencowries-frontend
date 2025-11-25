import React, { useEffect, useMemo, useState } from 'react';
import PageContainer from '../components/ui/PageContainer';
import GlassCard from '../components/ui/GlassCard';
import QuestCardHybrid from '../components/quests/QuestCardHybrid';
import XPBarWave from '../components/ui/XPBarWave';
import { API_BASE } from '../config';

const tabs = ['Daily', 'Partner', 'Insider', 'Social', 'On-chain', 'Referral'];

const QuestsPage = () => {
  const [active, setActive] = useState('Daily');
  const [quests, setQuests] = useState([]);
  const filtered = useMemo(() => quests.filter((q) => q.category === active), [quests, active]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/quests`);
        if (res.ok) {
          const data = await res.json();
          setQuests(data);
          return;
        }
      } catch (err) {
        console.warn('quests fallback', err);
      }
      setQuests([
        { id: 1, title: 'Chart the Isles', category: 'Daily', points: 200, reward: '200 XP', progress: 40 },
        { id: 2, title: 'Partner Voyage', category: 'Partner', points: 500, reward: 'NFT Badge', progress: 10 },
        { id: 3, title: 'Insider Signal', category: 'Insider', points: 350, reward: '300 XP', progress: 80, locked: true, requiredLevel: 8 },
        { id: 4, title: 'Social Tide', category: 'Social', points: 120, reward: '80 XP', progress: 20 },
        { id: 5, title: 'On-chain Dive', category: 'On-chain', points: 800, reward: 'TON perk', progress: 60 },
        { id: 6, title: 'Invite Swell', category: 'Referral', points: 300, reward: '250 XP', progress: 15 },
      ]);
    }
    load();
  }, []);

  const handleClaim = async (quest) => {
    try {
      await fetch(`${API_BASE}/api/quests/claim`, { method: 'POST', body: JSON.stringify({ id: quest.id }) });
    } catch (err) {
      console.warn('claim fallback', err);
    }
  };

  return (
    <PageContainer>
      <GlassCard title="Quest Board" subtitle="Hybrid ocean wave progress">
        <XPBarWave progress={62} />
        <div className="flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              className="btn-ghost"
              style={{
                borderColor: active === tab ? 'var(--gold)' : undefined,
                background: active === tab ? 'rgba(255,216,107,0.15)' : undefined,
              }}
              onClick={() => setActive(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="card-grid">
          {filtered.map((quest) => (
            <QuestCardHybrid key={quest.id} quest={quest} onClaim={handleClaim} />
          ))}
        </div>
      </GlassCard>
    </PageContainer>
  );
};

export default QuestsPage;
