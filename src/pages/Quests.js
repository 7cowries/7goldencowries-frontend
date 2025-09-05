import React, { useEffect, useRef, useState } from 'react';
import { getQuests, claimQuest } from '../lib/api';
import Toast from '../components/Toast';
import ProfileWidget from '../components/ProfileWidget';
import './Quests.css';
import '../App.css';

export default function Quests() {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claiming, setClaiming] = useState({});
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const walletRef = useRef('');

  const loadQuests = async () => {
    try {
      const q = await getQuests(walletRef.current);
      setQuests(q.quests || q || []);
    } catch (e) {
      setError(e.message || 'Failed to load quests');
    }
  };

  useEffect(() => {
    const sync = async () => {
      walletRef.current = localStorage.getItem('wallet') || '';
      await loadQuests();
      setLoading(false);
    };
    sync();

    const onStorage = (e) => {
      if (e.key === 'wallet') sync();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleClaim = async (id) => {
    setClaiming((c) => ({ ...c, [id]: true }));
    try {
      const res = await claimQuest(walletRef.current, id);
      setToast(res?.alreadyClaimed ? 'Already claimed' : 'Quest claimed');
      await loadQuests();
    } catch (e) {
      setToast(e.message || 'Failed to claim');
    } finally {
      setClaiming((c) => ({ ...c, [id]: false }));
      setTimeout(() => setToast(''), 3000);
    }
  };

  const shownQuests =
    activeTab === 'all'
      ? quests
      : quests.filter((q) => (q.type || '').toLowerCase() === activeTab);

  if (loading) return <p>Loading quests...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="page">
      <video autoPlay loop muted playsInline className="bg-video">
        <source src="/videos/sea-goddess.mp4" type="video/mp4" />
      </video>
      <div className="veil" />

      <div className="q-container">
        <div className="glass profile-strip">
          <ProfileWidget />
        </div>

        <div className="glass-strong q-header">
          <div className="q-title">
            <span className="emoji">📜</span>
            <h1>Quests</h1>
          </div>
          <p className="subtitle">Complete tasks. Earn XP. Level up.</p>
          <div className="tabs">
            {['all','daily','social','partner','insider','onchain'].map((type) => (
              <button
                key={type}
                className={`tab ${activeTab === type ? 'active' : ''}`}
                onClick={() => setActiveTab(type)}
              >
                {type === 'all' && 'All Quests'}
                {type === 'daily' && '📅 Daily'}
                {type === 'social' && '🌐 Social'}
                {type === 'partner' && '🤝 Partner'}
                {type === 'insider' && '🧠 Insider'}
                {type === 'onchain' && '🧾 Onchain'}
              </button>
            ))}
          </div>
        </div>

        <div className="q-list">
          {shownQuests.length === 0 ? (
            <div className="glass quest-card">
              <p className="quest-title">No quests yet for this category.</p>
            </div>
          ) : (
            shownQuests.map((q) => (
              <div key={q.id} className="glass quest-card">
                <div className="q-row">
                  <span className={`chip ${q.type}`}>
                    {q.type?.charAt(0).toUpperCase() + q.type?.slice(1)}
                  </span>
                  <span className="xp-badge">+{q.xp} XP</span>
                </div>
                <p className="quest-title">{q.title || q.id}</p>
                {q.url ? (
                  <div className="muted mono" style={{ wordBreak: 'break-all' }}>
                    {q.url}
                  </div>
                ) : null}
                <div className="actions">
                  {q.alreadyClaimed || q.claimed ? (
                    <button className="btn success" disabled>
                      Claimed
                    </button>
                  ) : q.url ? (
                    <>
                      <a
                        className="btn primary"
                        href={q.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Visit
                      </a>
                      <button
                        className="btn ghost"
                        onClick={() => handleClaim(q.id)}
                        disabled={!!claiming[q.id]}
                      >
                        {claiming[q.id] ? 'Claiming...' : 'Claim'}
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn primary"
                      onClick={() => handleClaim(q.id)}
                      disabled={!!claiming[q.id]}
                    >
                      {claiming[q.id] ? 'Claiming...' : 'Claim'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <Toast message={toast} />
      </div>
    </div>
  );
}
