import React, { useEffect, useState, useRef } from 'react';
import { getQuests, claimQuest, getMe } from '../utils/api';
import Toast from '../components/Toast';
import ProfileWidget from '../components/ProfileWidget';
import QuestCard from '../components/QuestCard';
import Page from '../components/Page';
import './Quests.css';
import '../App.css';
import { burstConfetti } from '../utils/confetti';

export default function Quests() {
  const [quests, setQuests] = useState([]);
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claiming, setClaiming] = useState({});
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [me, setMe] = useState(null);
  const walletRef = useRef('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function loadQuests(signal) {
    const data = await getQuests({ signal });
    if (!mountedRef.current) return;
    setQuests(data?.quests ?? []);
    setXp(data?.xp ?? 0);
  }

  async function loadMe() {
    try {
      const data = await getMe();
      if (mountedRef.current) setMe(data);
    } catch {}
  }

  async function sync() {
    setLoading(true);
    const controller = new AbortController();
    try {
      await loadQuests(controller.signal);
      if (mountedRef.current) setError(null);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e?.message || 'Failed to load quests. Please try again.');
      console.error('[Quests] load error:', e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  useEffect(() => {
    walletRef.current = localStorage.getItem('wallet') || '';
    sync();
    loadMe();
    const onWalletChanged = (e) => {
      walletRef.current = e?.detail?.wallet || localStorage.getItem('wallet') || '';
      loadMe();
      sync();
    };
    const onStorage = (e) => {
      if (e.key === 'wallet') {
        onWalletChanged();
      }
    };
    window.addEventListener('wallet:changed', onWalletChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('wallet:changed', onWalletChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    const reload = () => {
      loadMe();
      sync();
    };
    window.addEventListener('profile-updated', reload);
    window.addEventListener('focus', reload);
    return () => {
      window.removeEventListener('profile-updated', reload);
      window.removeEventListener('focus', reload);
    };
  }, []);

    const handleClaim = async (id) => {
      walletRef.current = localStorage.getItem('wallet') || '';
      if (claiming[id]) return;
      setClaiming((c) => ({ ...c, [id]: true }));
      try {
        const res = await claimQuest(id);
        if (process.env.NODE_ENV !== 'production') {
          console.log('claim_clicked', id, res);
        }
        burstConfetti();
        const delta = res?.xpDelta ?? res?.xp;
        setToast(delta != null ? `+${delta} XP` : 'Quest claimed');
        await Promise.all([getMe(), getQuests()]).then(([meData, questsData]) => {
          if (mountedRef.current) {
            setMe(meData);
            setQuests(questsData?.quests ?? []);
            setXp(questsData?.xp ?? 0);
          }
        });
        window.dispatchEvent(new Event('profile-updated'));
      } catch (e) {
        setToast(e.message || 'Failed to claim quest');
      } finally {
        setClaiming((c) => ({ ...c, [id]: false }));
        setTimeout(() => setToast(''), 3000);
      }
    };

  const shownQuests =
    activeTab === 'all'
      ? quests.filter((q) => q.active === 1)
      : quests.filter(
          (q) =>
            (q.category || 'All').toLowerCase() === activeTab && q.active === 1
        );


  if (loading) return <div className="loading">Loading quests…</div>;
  if (!loading && error)
    return (
      <div className="error">
        {error} <button onClick={sync}>Retry</button>
      </div>
    );

  return (
    <Page>
      <div className="q-container">
        <div className="glass profile-strip">
          <ProfileWidget />
        </div>

        <div className="glass-strong q-header">
          <div className="q-title">
            <span className="emoji">📜</span>
            <h1><span className="yolo-gradient">Quests</span></h1>
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
                <QuestCard
                  key={q.id}
                  quest={q}
                  me={me}
                  onClaim={handleClaim}
                  claiming={!!claiming[q.id]}
                  setToast={setToast}
                />
              ))
            )}
        </div>

        <Toast message={toast} />
      </div>
    </Page>
  );
}
