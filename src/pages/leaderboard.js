import React, { useEffect, useState } from 'react';
import PageContainer from '../components/ui/PageContainer';
import GlassCard from '../components/ui/GlassCard';
import LeaderboardRow from '../components/ui/LeaderboardRow';
import { API_BASE } from '../config';

const Leaderboard = () => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          setEntries(data);
          return;
        }
      } catch (err) {
        console.warn('leaderboard fallback', err);
      }
      setEntries([
        { name: 'Aqua Nova', level: 18, progress: 86, xp: 12800 },
        { name: 'Gold Tide', level: 15, progress: 74, xp: 10400 },
        { name: 'Siren', level: 14, progress: 68, xp: 9800 },
      ]);
    }
    load();
  }, []);

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <PageContainer>
      <GlassCard title="Leaderboard" subtitle="Gold podium & XP micro-bars">
        <div className="podium">
          {podium.map((p, i) => (
            <div key={p.name} className="podium-card">
              <div style={{ fontSize: 24 }}>#{i + 1}</div>
              <div>{p.name}</div>
              <div style={{ marginTop: 6 }}>{p.xp} XP</div>
            </div>
          ))}
        </div>
        {rest.length > 0 && (
          <div className="table-scroll">
            <table className="table-glass">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th>Level</th>
                  <th>Progress</th>
                  <th>XP</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((entry, i) => (
                  <LeaderboardRow key={entry.name} entry={entry} index={i + 3} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </PageContainer>
  );
};

export default Leaderboard;
