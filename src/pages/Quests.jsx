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
import './Quests.css';
import '../App.css';
import { burstConfetti } from '../utils/confetti';
import { useWallet } from '../hooks/useWallet';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Quests() {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const loadQuests = useCallback(async (signal) => {
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
        const status = String(quest.proofStatus || quest.proof_status || '').toLowerCase();
        const finished = quest.completed || quest.claimed || quest.alreadyClaimed;
        if (finished || status === 'approved') {
          mutated = true;
          delete next[quest.id];
        }
      });
      return mutated ? next : prev;
    });
  }, []);

  const loadMe = useCallback(async () => {
    try {
      const data = await getMe();
      if (mountedRef.current) setMe(data);
    } catch {}
  }, []);

  const sync = useCallback(async () => {
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
      loadMe();
      sync();
    };
    window.addEventListener('profile-updated', reload);
    window.addEventListener('focus', reload);
    return () => {
      window.removeEventListener('profile-updated', reload);
      window.removeEventListener('focus', reload);
    };
  }, [loadMe, sync]);

  const detectSpecialClaimType = useCallback((quest) => {
    if (!quest || typeof quest !== 'object') return null;
    const pathy = [
      quest.claimType,
      quest.claim_type,
      quest?.claim?.type,
      quest?.action?.type,
      quest?.actionType,
    ]
      .filter(Boolean)
      .map((v) => String(v).toLowerCase());
    const requirement = String(quest.requirement || quest.gate || '').toLowerCase();
    const slug = String(quest.slug || quest.code || '').toLowerCase();
    const tags = Array.isArray(quest.tags)
      ? quest.tags.map((tag) => String(tag).toLowerCase())
      : [];

    const isSubscription =
      pathy.some((p) => p.includes('subscription')) ||
      requirement.includes('subscription') ||
      tags.includes('subscription') ||
      slug.includes('subscription');

    const isReferral =
      pathy.some((p) => p.includes('referral')) ||
      requirement.includes('referral') ||
      tags.includes('referral') ||
      slug.includes('referral');

    if (isSubscription) return 'subscription';
    if (isReferral) return 'referral';
    return null;
  }, []);

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
        setTimeout(() => setToast(''), 3000);
        return;
      }
      if (claiming[id]) return;

      setClaiming((c) => ({ ...c, [id]: true }));
      setBlockedClaims((prev) => ({ ...prev, [id]: undefined }));

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

        const errorCode = String(res?.error || res?.code || '').toLowerCase();
        if (errorCode === 'proof-required' || errorCode === 'proof_required') {
          setBlockedClaims((prev) => ({ ...prev, [id]: 'proof-required' }));
          setToast('Submit proof to claim this quest');
          return;
        }

        burstConfetti();
        const delta = res?.xpDelta ?? res?.xp;
        setToast(delta != null ? `+${delta} XP` : 'Quest claimed');

        const [meData, questsData] = await Promise.all([getMe(), getQuests()]);
        if (mountedRef.current) {
          setMe(meData);
          const items = questsData?.quests ?? [];
          setQuests(items);
          setBlockedClaims((prev) => {
            if (!prev || !prev[id]) return prev;
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }
      } catch (e) {
        const msg = e?.message || '';
        if (msg.toLowerCase().includes('proof-required')) {
          setBlockedClaims((prev) => ({ ...prev, [id]: 'proof-required' }));
          setToast('Submit proof to claim this quest');
        } else {
          setToast(msg || 'Failed to claim quest');
        }
      } finally {
        setClaiming((c) => ({ ...c, [id]: false }));
        setTimeout(() => setToast(''), 3000);
      }
    },
    [claiming, detectSpecialClaimType, isConnected, quests]
  );

  const tabs = useMemo(
    () => ['all', 'daily', 'social', 'partner', 'insider', 'onchain'],
    []
  );

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
                  blockedReason={blockedClaims[q.id]}
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
