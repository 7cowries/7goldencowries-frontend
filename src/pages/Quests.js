import React, { useEffect, useState, useRef } from 'react';
import { getQuests, claimQuest, getProfile, getProofStatus } from '../utils/api';
import { isProofRequired } from '../utils/proof';
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
    const wallet = localStorage.getItem('wallet') || '';
    let list = data?.quests ?? [];
    list = await Promise.all(
      list.map(async (q) => {
        if (isProofRequired(q) && typeof q.proofStatus === 'undefined') {
          try {
            const ps = await getProofStatus(wallet, q.id, { signal });
            return { ...q, proofStatus: ps?.status, proofReason: ps?.reason };
          } catch {
            return q;
          }
        }
        return q;
      })
    );
    list.sort((a, b) => {
      const aActive = a.active ? 1 : 0;
      const bActive = b.active ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      const aSort = a.sort ?? 0;
      const bSort = b.sort ?? 0;
      if (aSort !== bSort) return aSort - bSort;
      const aId = String(a.id || '');
      const bId = String(b.id || '');
      return aId.localeCompare(bId);
    });
    setQuests(list);
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
    sync();
    const onStorage = (e) => {
      if (e.key === 'wallet') sync();
    };
    const onWallet = () => sync();
    window.addEventListener('storage', onStorage);
    window.addEventListener('wallet-updated', onWallet);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('wallet-updated', onWallet);
    };
  }, []);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();
        setMe(data);
      } catch {}
    }
    loadProfile();
    const onProfile = () => loadProfile();
    window.addEventListener('profile-updated', onProfile);
    return () => window.removeEventListener('profile-updated', onProfile);
  }, []);

  const handleClaim = async (id) => {
    if (claiming[id]) return; // guard duplicate clicks
    setClaiming((c) => ({ ...c, [id]: true }));
    try {
      const wallet = localStorage.getItem('wallet') || '';
      const res = await claimQuest(wallet, id);
      if (res?.alreadyClaimed) {
        setToast('Already claimed');
      } else {
        setToast('Quest claimed');
      }
      await sync();
      window.dispatchEvent(new Event('profile-updated'));
    } catch (e) {
      if (e.status === 403 && /Submit a valid proof first/i.test(e.message)) {
        const q = quests.find((x) => x.id === id);
        if (q) setProofQuest(q);
      } else {
        setToast(e.message || 'Failed to claim quest');
      }
    } finally {
      setClaiming((c) => ({ ...c, [id]: false }));
      setTimeout(() => setToast(''), 3000);
    }
  };

  const shownQuests =
    activeTab === 'all'
      ? quests
      : quests.filter((q) => (q.type || '').toLowerCase() === activeTab);

  const handleProof = (q) => {
    if (!me?.socials?.twitter?.connected) {
      setToast('Connect Twitter first');
      setTimeout(() => setToast(''), 3000);
      return;
    }
    setProofQuest(q);
  };

  const onProofVerified = () => {
    setToast('Proof verified');
    setTimeout(() => setToast(''), 3000);
    sync();
    window.dispatchEvent(new Event('profile-updated'));
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
                  <span className={`chip ${q.type}`}>
                    {q.type?.charAt(0).toUpperCase() + q.type?.slice(1)}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {typeof q.proofStatus === 'string' ? (
                      <span className={`chip ${q.proofStatus}`}>{
                        q.proofStatus.charAt(0).toUpperCase() + q.proofStatus.slice(1)
                      }</span>
                    ) : (
                      isProofRequired(q) && (
                        <span className="chip proof-required">Proof required</span>
                      )
                    )}
                    <span className="xp-badge">+{q.xp} XP</span>
                  </div>
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
                  ) : (
                    <>
                      {isProofRequired(q) && (
                        <button
                          className="btn primary"
                          onClick={() => handleProof(q)}
                          disabled={!!claiming[q.id] || !me?.socials?.twitter?.connected}
                        >
                          Submit proof
                        </button>
                      )}
                      {q.url && !isProofRequired(q) && (
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
                          (isProofRequired(q) && q.proofStatus !== 'verified')
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
            wallet={localStorage.getItem('wallet') || ''}
            onClose={() => setProofQuest(null)}
            onVerified={onProofVerified}
          />
        )}
      </div>
    </div>
  );
}
