import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  getQuests,
  claimQuest,
  getMe,
  claimSubscriptionReward,
  claimReferralReward,
} from '../utils/api';
import Toast from '../components/Toast';
import ProfileWidget from '../components/ProfileWidget';
import QuestCard from '../components/QuestCard';
import Page from '../components/Page';
import { burstConfetti } from '../utils/confetti';
import useWallet from '../hooks/useWallet';
import ErrorBoundary from '../components/ErrorBoundary';
import { detectSpecialClaimType } from '../lib/claimType';

const PROOF_REQUIRED = 'proof-required';
const TOAST_DISMISS_MS = process.env.NODE_ENV === 'test' ? 0 : 3000;

function normalizeStatus(status) {
  return String(status || '').toLowerCase();
}

function isProofRequired(value) {
  const text = String(value || '').toLowerCase();
  return text.includes('proof-required') || text.includes('proof_required');
}

function responseRequiresProof(res) {
  if (!res) return false;
  if (typeof res === 'string') return isProofRequired(res);
  if (res instanceof Error) return isProofRequired(res.message);
  if (typeof res === 'object') {
    return (
      isProofRequired(res.error) ||
      isProofRequired(res.code) ||
      isProofRequired(res.message)
    );
  }
  return false;
}

export default function Quests() {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [claiming, setClaiming] = useState({});
  const [blockedClaims, setBlockedClaims] = useState({});
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [me, setMe] = useState(null);
  const mountedRef = useRef(true);
  const { wallet, isConnected } = useWallet();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadQuests = useCallback(async ({ signal } = {}) => {
    const data = await getQuests({ signal });
    if (!mountedRef.current) return;
    const items = data?.quests ?? [];
    setQuests(items);
    setBlockedClaims((prev) => {
      if (!prev || Object.keys(prev).length === 0) return prev;
      let mutated = false;
      const next = { ...prev };
      items.forEach((quest) => {
        if (!quest || !next[quest.id]) return;
        const status = normalizeStatus(quest.proofStatus || quest.proof_status);
        const finished = quest.completed || quest.claimed || quest.alreadyClaimed;
        if (finished || status === 'approved') {
          mutated = true;
          delete next[quest.id];
        }
      });
      return mutated ? next : prev;
    });
  }, []);

  const loadMe = useCallback(async (opts = {}) => {
    try {
      const data = await getMe(opts);
      if (mountedRef.current) setMe(data);
    } catch {}
  }, []);

  const sync = useCallback(async ({ background } = {}) => {
    if (!background) setLoading(true);
    const controller = new AbortController();
    try {
      await loadQuests({ signal: controller.signal });
      if (mountedRef.current) setError(null);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e?.message || 'Failed to load quests. Please try again.');
      console.error('[Quests] load error:', e);
    } finally {
      if (!background && mountedRef.current) setLoading(false);
    }
  }, [loadQuests]);

  useEffect(() => {
    sync();
    loadMe();
  }, [wallet, loadMe, sync]);

  useEffect(() => {
    if (!wallet && mountedRef.current) {
      setMe(null);
    }
  }, [wallet]);

  useEffect(() => {
    const reload = () => {
      loadMe({ force: true });
      sync({ background: true });
    };
    window.addEventListener('profile-updated', reload);
    window.addEventListener('focus', reload);
    return () => {
      window.removeEventListener('profile-updated', reload);
      window.removeEventListener('focus', reload);
    };
  }, [loadMe, sync]);

  const handleClaim = useCallback(
    async (questLike) => {
      const quest =
        typeof questLike === 'object' && questLike
          ? questLike
          : quests.find((entry) => entry.id === questLike);
      const id = quest?.id ?? questLike;
      if (!id) return;

      if (!isConnected) {
        setToast('Connect your wallet to claim quests');
        setTimeout(() => setToast(''), TOAST_DISMISS_MS);
        return;
      }
      if (claiming[id]) return;

      setClaiming((c) => ({ ...c, [id]: true }));
      setBlockedClaims((prev) => {
        if (!prev || !prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });

      try {
        const special = detectSpecialClaimType(quest);
        let res;

        if (special === 'subscription') {
          res = await claimSubscriptionReward({ questId: id });
        } else if (special === 'referral') {
          res = await claimReferralReward({ questId: id });
        } else {
          res = await claimQuest(id);
        }

        if (process.env.NODE_ENV !== 'production') {
          console.log('claim_clicked', id, res);
        }

        if (responseRequiresProof(res)) {
          setBlockedClaims((prev) => ({ ...prev, [id]: PROOF_REQUIRED }));
          setToast('Submit proof to claim this quest');
          return;
        }

        burstConfetti();
        const delta = res?.xpDelta ?? res?.xp;
        setToast(delta != null ? `+${delta} XP` : 'Quest claimed');

        await Promise.all([loadMe({ force: true }), loadQuests()]);
        setBlockedClaims((prev) => {
          if (!prev || !prev[id]) return prev;
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } catch (e) {
        const msg = e?.message || '';
        if (responseRequiresProof(e)) {
          setBlockedClaims((prev) => ({ ...prev, [id]: PROOF_REQUIRED }));
          setToast('Submit proof to claim this quest');
        } else {
          setToast(msg || 'Failed to claim quest');
        }
      } finally {
        setClaiming((c) => ({ ...c, [id]: false }));
        setTimeout(() => setToast(''), TOAST_DISMISS_MS);
      }
    },
    [claiming, isConnected, quests, loadMe, loadQuests]
  );

  const tabs = useMemo(
    () => ['all', 'daily', 'social', 'partner', 'insider', 'onchain'],
    []
  );

  const handleProofStatusChange = useCallback(({ questId, status }) => {
    if (!questId) return;
    const normalized = normalizeStatus(status);
    setQuests((prev) => {
      if (!Array.isArray(prev) || prev.length === 0) return prev;
      let mutated = false;
      const next = prev.map((quest) => {
        if (!quest || quest.id !== questId) return quest;
        const current = normalizeStatus(quest.proofStatus || quest.proof_status);
        if (current === normalized) return quest;
        mutated = true;
        return { ...quest, proofStatus: normalized };
      });
      return mutated ? next : prev;
    });
    if (normalized === 'approved') {
      setBlockedClaims((prev) => {
        if (!prev || !prev[questId]) return prev;
        const next = { ...prev };
        delete next[questId];
        return next;
      });
    }
  }, []);

  const shownQuests = useMemo(
    () =>
      activeTab === 'all'
        ? quests.filter((q) => q.active === 1)
        : quests.filter(
            (q) =>
              (q.category || 'All').toLowerCase() === activeTab && q.active === 1
          ),
    [activeTab, quests]
  );
  if (loading)
    return (
      <Page>
        <div className="glass-strong q-fallback">
          <h2>Loading quests…</h2>
          <p className="muted">Summoning the Seven Isles challenges.</p>
        </div>
      </Page>
    );

  if (!loading && error)
    return (
      <Page>
        <div className="glass-strong q-fallback error">
          <h2>We can’t load quests right now</h2>
          <p className="muted">{error}</p>
          <button className="btn ghost" onClick={sync}>
            Retry
          </button>
        </div>
      </Page>
    );

  return (
    <Page>
      <ErrorBoundary>
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
              {tabs.map((type) => (
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
                  canClaim={isConnected}
                  blockedReason={blockedClaims?.[q.id]}
                  onProofStatusChange={handleProofStatusChange}
                />
              ))
            )}
          </div>

          <Toast message={toast} />
        </div>
      </ErrorBoundary>
    </Page>
  );
}
