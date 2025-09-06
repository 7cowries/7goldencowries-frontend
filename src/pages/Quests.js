import React, { useEffect, useState, useRef } from 'react';
import { getQuests, claimQuest, getMe } from '../utils/api';
import Toast from '../components/Toast';
import ProfileWidget from '../components/ProfileWidget';
import ProofModal from '../components/ProofModal';
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
    const onStorage = (e) => {
      if (e.key === 'wallet') {
        walletRef.current = e.newValue || '';
        sync();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
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
              <div key={q.id} className="glass quest-card">
                <div className="q-row">
                  {q.type === 'link' ? (
                    q.url ? (
                      <a
                        href={q.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`chip ${q.type}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Link
                      </a>
                    ) : (
                      <span className={`chip ${q.type}`}>Link</span>
                    )
                  ) : (
                    <span className={`chip ${q.type}`}>
                      {q.type?.charAt(0).toUpperCase() + q.type?.slice(1)}
                    </span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {typeof q.proofStatus === 'string' && (
                      <span className={`chip ${q.proofStatus}`}>{
                        q.proofStatus.charAt(0).toUpperCase() + q.proofStatus.slice(1)
                      }</span>
                    )}
                    <span className="xp-badge">+{q.xp} XP</span>
                  </div>
                </div>
                <p className="quest-title">
                  {q.url ? (
                    <a
                      href={q.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {q.title || q.id}
                    </a>
                  ) : (
                    q.title || q.id
                  )}
                </p>
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
                  ) : (
                    <>
                      {typeof q.proofStatus !== 'undefined' && (
                        <button
                          className="btn primary"
                          onClick={() => handleProof(q)}
                          disabled={!!claiming[q.id]}
                        >
                          Submit proof
                        </button>
                      )}
                      {q.url && typeof q.proofStatus === 'undefined' && (
                        <a
                          className="btn primary"
                          href={q.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Visit
                        </a>
                      )}
                      <button
                        className="btn ghost"
                        onClick={() => handleClaim(q.id)}
                        disabled={
                          !!claiming[q.id] ||
                          (typeof q.proofStatus !== 'undefined' && q.proofStatus !== 'verified')
                        }
                      >
                        {claiming[q.id] ? 'Claiming...' : 'Claim'}
                      </button>
                    </>
                  )}
                </div>
              </div>
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
