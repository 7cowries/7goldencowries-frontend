import React, { useEffect, useState, useRef } from 'react';
import { getQuests, getMe } from '../utils/api';
import Toast from '../components/Toast';
import ProfileWidget from '../components/ProfileWidget';
import QuestCard from '../components/QuestCard';
import './Quests.css';
import '../App.css';

export default function Quests() {
  const [quests, setQuests] = useState([]);
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [me, setMe] = useState(null);
  const [toast, setToast] = useState('');
  const walletRef = useRef('');
  const mountedRef = useRef(true);

  const refetchAll = async () => {
    try {
      const [meData, questsData] = await Promise.all([getMe(), getQuests()]);
      if (!mountedRef.current) return;
      setMe(meData);
      setQuests(questsData?.quests ?? []);
      setXp(questsData?.xp ?? 0);
    } catch (e) {
      if (mountedRef.current) setError(e?.message || 'Failed to load quests. Please try again.');
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    walletRef.current = localStorage.getItem('wallet') || '';
    refetchAll().finally(() => {
      if (mountedRef.current) setLoading(false);
    });
    const onWalletChanged = () => {
      walletRef.current = localStorage.getItem('wallet') || '';
      refetchAll();
    };
    const onStorage = (e) => {
      if (e.key === 'wallet') onWalletChanged();
    };
    window.addEventListener('wallet:changed', onWalletChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      mountedRef.current = false;
      window.removeEventListener('wallet:changed', onWalletChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const shownQuests =
    activeTab === 'all'
      ? quests.filter((q) => q.active === 1)
      : quests.filter((q) => (q.category || 'All').toLowerCase() === activeTab && q.active === 1);

  if (loading) return <div className="loading">Loading quests…</div>;
  if (!loading && error)
    return (
      <div className="error">
        {error} <button onClick={() => refetchAll()}>Retry</button>
      </div>
    );

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
              <QuestCard key={q.id} quest={q} refetchAll={refetchAll} />
            ))
          )}
        </div>

        <Toast message={toast} />
      </div>
    </div>
  );
}
