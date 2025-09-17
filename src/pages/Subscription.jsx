import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Page from '../components/Page';
import WalletConnect from '../components/WalletConnect';
import { useWallet } from '../hooks/useWallet';
import { getSubscriptionStatus, claimSubscriptionBonus } from '../utils/api';
import './Subscription.css';

export default function SubscriptionPage() {
  const { wallet } = useWallet();
  const [status, setStatus] = useState({ tier: 'Free' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');
  const abortRef = useRef(null);
  const toastTimerRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setErr('');
    try {
      const res = await getSubscriptionStatus({ signal: ac.signal });
      setStatus(res || { tier: 'Free' });
    } catch (e) {
      if (e?.name === 'AbortError') return;
      const message =
        typeof e?.message === 'string' && e.message.toLowerCase().includes('failed to fetch')
          ? 'Network error: Failed to fetch'
          : e?.message || 'Network error: Failed to fetch';
      setErr(message);
    } finally {
      if (abortRef.current === ac) {
        abortRef.current = null;
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [wallet, fetchStatus]);

  useEffect(() => {
    const onProfileUpdated = () => {
      fetchStatus();
    };
    window.addEventListener('profile-updated', onProfileUpdated);
    return () => {
      window.removeEventListener('profile-updated', onProfileUpdated);
    };
  }, [fetchStatus]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const onClaim = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await claimSubscriptionBonus();
      const gained = Number(res?.xpDelta ?? 0);
      const msg = gained > 0 ? `+${gained} XP earned 🎉` : 'Already claimed';
      setToast(msg);
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = setTimeout(() => setToast(''), 2200);
      setStatus((prev) => {
        if (res && typeof res === 'object' && res.status) {
          return res.status;
        }
        if (gained > 0) {
          return { ...prev, canClaim: false };
        }
        return prev;
      });
    } catch (e) {
      const message =
        typeof e?.message === 'string' && e.message.toLowerCase().includes('failed to fetch')
          ? 'Network error: Failed to fetch'
          : e?.message || 'Claim failed';
      setErr(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const levelLabel = useMemo(() => status.levelName ?? 'Shellborn', [status.levelName]);
  const tierLabel = useMemo(() => status.tier ?? 'Free', [status.tier]);
  const canClaim = status?.canClaim !== false;

  return (
    <Page>
      <div className="container">
        <h1>🌊 Your Subscription</h1>

        {!wallet ? (
          <>
            <p>Connect your TON wallet to see your subscription.</p>
            <WalletConnect />
          </>
        ) : (
          <>
            {err ? (
              <div className="error-banner">
                {err}
                <button
                  className="mini"
                  onClick={fetchStatus}
                  disabled={loading}
                  style={{ marginLeft: 8 }}
                >
                  Retry
                </button>
              </div>
            ) : null}

            <div className="card glass" style={{ marginTop: 12 }}>
              <p>
                <strong>Level:</strong> {levelLabel}
              </p>
              <p>
                <strong>Subscription Tier:</strong> {tierLabel}
              </p>
              <div style={{ marginTop: 10 }}>
                <button
                  className="btn"
                  onClick={onClaim}
                  disabled={loading || !canClaim}
                >
                  {loading
                    ? 'Working…'
                    : canClaim
                    ? 'Claim Subscription XP Bonus'
                    : 'Bonus Already Claimed'}
                </button>
              </div>
            </div>

            {toast ? <div className="toast">{toast}</div> : null}
          </>
        )}
      </div>
    </Page>
  );
}
