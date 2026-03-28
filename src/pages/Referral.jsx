import React, { useEffect, useMemo, useState } from 'react';
import Page from '../components/Page';
import WalletStatus from '@/components/WalletStatus';
import useWallet from '../hooks/useWallet';
import { getMe, getReferralsList } from '../utils/api';

const shareText = 'Join me on 7GoldenCowries and earn XP together';

export default function Referral() {
  const { wallet } = useWallet();
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getMe()
      .then((me) => setReferralCode(me?.referral_code || me?.referralCode || ''))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!referralCode) return;
    setLoading(true);
    setError('');
    getReferralsList()
      .then((data) => setReferrals(data?.entries || data?.referrals || []))
      .catch((err) => setError(err?.message || 'Failed to load referrals'))
      .finally(() => setLoading(false));
  }, [referralCode]);

  const referralLink = useMemo(
    () =>
      referralCode
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${referralCode}`
        : '',
    [referralCode]
  );

  const copyLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
    } catch {}
  };

  return (
    <Page>
      <section className="section">
        <h1>Referral Program</h1>
        <p className="subtitle">Invite friends, track joins, and earn progression bonuses.</p>
        <WalletStatus />
      </section>

      <section className="section">
        <h2>Your link</h2>
        {!wallet && <p className="muted">Connect wallet to activate your referral identity.</p>}
        {wallet && !referralCode && <p className="muted">Generating your referral code…</p>}
        {referralCode && (
          <div className="card glass">
            <p className="mono">{referralLink}</p>
            <div className="cta-row">
              <button className="btn" onClick={copyLink}>Copy Link</button>
              <a
                className="btn ghost"
                target="_blank"
                rel="noreferrer"
                href={`https://x.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${referralLink}`)}`}
              >
                Share on X
              </a>
              <a
                className="btn ghost"
                target="_blank"
                rel="noreferrer"
                href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`}
              >
                Share on Telegram
              </a>
            </div>
          </div>
        )}
      </section>

      <section className="section">
        <h2>Referral activity</h2>
        {loading && <p className="muted">Loading referral activity…</p>}
        {!!error && <p className="muted">{error}</p>}
        {!loading && !error && referrals.length === 0 && (
          <p className="muted">No referrals yet. Share your link to get started.</p>
        )}
        {!loading && referrals.length > 0 && (
          <div className="card glass">
            {referrals.map((r, i) => (
              <p key={`${r.wallet || r.address || 'ref'}-${i}`}>
                {shorten(r.wallet || r.address)}
                {r.joinedAt ? ` • ${new Date(r.joinedAt).toLocaleDateString()}` : ''}
                {typeof r.xp === 'number' ? ` • ${r.xp} XP` : ''}
              </p>
            ))}
          </div>
        )}
      </section>
    </Page>
  );
}

function shorten(addr = '') {
  if (!addr) return '';
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
