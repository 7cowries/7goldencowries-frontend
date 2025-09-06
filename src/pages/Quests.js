import React, { useEffect, useState, useRef } from 'react';
import { getQuests, claimQuest, getMe } from '../utils/api';
import Toast from '../components/Toast';
import ProfileWidget from '../components/ProfileWidget';
import ProofModal from '../components/ProofModal';
import QuestCard from '../components/QuestCard';
import './Quests.css';
import '../App.css';

export default function Quests() {
  const [quests, setQuests] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claiming, setClaiming] = useState({});
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [me, setMe] = useState(null);
  const [proofQuest, setProofQuest] = useState(null);
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
    setCompleted(data?.completed ?? []);
    setXp(data?.xp ?? 0);
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
    const onWalletChanged = () => {
      walletRef.current = localStorage.getItem('wallet') || '';
      sync();
    };
    const onStorage = (e) => {
      if (e.key === 'wallet') {
        onWalletChanged();
      }
    };
    window.addEventListener('wallet-changed', onWalletChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('wallet-changed', onWalletChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    async function loadMe() {
      try {
        const data = await getMe();
        setMe(data);
      } catch {}
    }
    loadMe();
    const onProfile = () => loadMe();
    window.addEventListener('profile-updated', onProfile);
    return () => window.removeEventListener('profile-updated', onProfile);
  }, []);

  const handleClaim = async (id) => {
    if (claiming[id]) return; // guard duplicate clicks
    setClaiming((c) => ({ ...c, [id]: true }));
    try {
      const res = await claimQuest(id);
      if (res?.alreadyClaimed) {
        setToast('Already claimed');
      } else {
        setToast(`Quest claimed! +${res?.xp ?? 0} XP`);
      }
      const [meData, questsData] = await Promise.all([getMe(), getQuests()]);
      if (mountedRef.current) {
        setMe(meData);
        setQuests(questsData?.quests ?? []);
        setCompleted(questsData?.completed ?? []);
        setXp(questsData?.xp ?? 0);
      }
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

  const handleProof = (q) => {
    setProofQuest(q);
  };

  const onProofSubmitted = () => {
    setToast('Proof submitted');
    setTimeout(() => setToast(''), 3000);
    sync();
    window.dispatchEvent(new Event('profile-updated'));
  };

  const onProofError = (msg) => {
    setToast(msg || 'Failed to submit proof');
    setTimeout(() => setToast(''), 3000);
  };

  if (loading) return <div className="loading">Loading quests…</div>;
  if (!loading && error)
    return (
      <div className="error">
        {error} <button onClick={sync}>Retry</button>
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
                <QuestCard
                  key={q.id}
                  quest={q}
                  onClaim={handleClaim}
                  onProof={handleProof}
                  claiming={!!claiming[q.id]}
                />
                ))
            )}
        </div>

        <Toast message={toast} />
        {proofQuest && (
          <ProofModal
            quest={proofQuest}
            onClose={() => setProofQuest(null)}
            onSuccess={onProofSubmitted}
            onError={onProofError}
            wallet={walletRef.current}
          />
        )}
      </div>
    </div>
  );
}
