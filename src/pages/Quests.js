import React, { useEffect, useState, useRef } from 'react';
import { getQuests, claimQuest, getMe } from '../utils/api';
import Toast from '../components/Toast';
import ProfileWidget from '../components/ProfileWidget';
import SubmitProofModal from '../components/SubmitProofModal';
import QuestCard from '../components/QuestCard';
import './Quests.css';
import '../App.css';

export default function Quests() {
  const [quests, setQuests] = useState([]);
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
    const onWalletChanged = (e) => {
      walletRef.current = e?.detail?.wallet || localStorage.getItem('wallet') || '';
      sync();
    };
    const onProfile = () => sync();
    const onStorage = (e) => {
      if (e.key === 'wallet') {
        onWalletChanged();
      }
    };
    window.addEventListener('wallet:changed', onWalletChanged);
    window.addEventListener('storage', onStorage);
    window.addEventListener('profile-updated', onProfile);
    return () => {
      window.removeEventListener('wallet:changed', onWalletChanged);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('profile-updated', onProfile);
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
    walletRef.current = localStorage.getItem('wallet') || '';
    if (claiming[id]) return; // guard duplicate clicks
    setClaiming((c) => ({ ...c, [id]: true }));
    try {
      const res = await claimQuest(id);
      if (process.env.NODE_ENV !== 'production') {
        console.log('claim_clicked', id, res);
      }
      if (res?.alreadyClaimed) {
        setToast('Already claimed');
      } else {
        const award = res?.awardedXp ?? res?.xp ?? 0;
        setToast(`Quest claimed! +${award} XP`);
      }
      const [meData, questsData] = await Promise.all([getMe(), getQuests()]);
      if (mountedRef.current) {
        setMe(meData);
        setQuests(questsData?.quests ?? []);
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
    walletRef.current = localStorage.getItem('wallet') || '';
    setProofQuest(q);
  };

  const onProofSubmitted = async (res) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('proof_submitted', proofQuest?.id, res?.status);
    }
    setToast('Proof submitted');
    setQuests((qs) =>
      qs.map((qq) =>
        qq.id === proofQuest?.id
          ? { ...qq, proofStatus: res?.status || 'pending' }
          : qq
      )
    );
    try {
      const [meData, questsData] = await Promise.all([getMe(), getQuests()]);
      if (mountedRef.current) {
        setMe(meData);
        setQuests(questsData?.quests ?? []);
        setXp(questsData?.xp ?? 0);
      }
    } catch {}
    setTimeout(() => setToast(''), 3000);
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
                  me={me}
                  onClaim={handleClaim}
                  onProof={handleProof}
                  claiming={!!claiming[q.id]}
                />
                ))
            )}
        </div>

        <Toast message={toast} />
        {proofQuest && (
          <SubmitProofModal
            quest={proofQuest}
            onClose={() => setProofQuest(null)}
            onSuccess={onProofSubmitted}
            onError={onProofError}
          />
        )}
      </div>
    </div>
  );
}
