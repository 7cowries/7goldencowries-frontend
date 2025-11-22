import React, { useEffect, useState } from 'react';
import Page from '../components/Page';
import WalletStatus from '@/components/WalletStatus';
import useWallet from '../hooks/useWallet';
import { getMe, listReferrals } from '../utils/api';
import { burstConfetti } from '../utils/confetti';

const Referral = () => {
  const { wallet } = useWallet();
  const isWalletConnected = !!wallet;

  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState([]);

  const referralLink = referralCode
    ? `${window.location.origin}/?ref=${referralCode}`
    : '';

  // Retrieve referral code on mount
  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        const code = me?.referral_code || me?.referralCode;
        if (code) {
          setReferralCode(code);
        }
      } catch (err) {
        console.error('Referral getMe error:', err);
      }
    })();
  }, []);

  // Fetch referrals list for this code
  useEffect(() => {
    if (!referralCode) return;

    listReferrals()
      .then((data) => {
        setReferrals(data.entries || data.referrals || []);
      })
      .catch((err) =>
        console.error(
          'Referral fetch error:',
          err?.response?.data || err.message || err
        )
      );
  }, [referralCode]);

  useEffect(() => {
    const rerun = () => {
      if (referralCode) {
        listReferrals()
          .then((data) => {
            setReferrals(data.entries || data.referrals || []);
          })
          .catch(() => {});
      }
    };
    window.addEventListener('profile-updated', rerun);
    return () => window.removeEventListener('profile-updated', rerun);
  }, [referralCode]);

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).catch(() => {});
    setCopied(true);
    burstConfetti({ count: 80, duration: 1800 });
    setTimeout(() => setCopied(false), 2000);
  };

  const renderIntroText = () => {
    if (referralCode) {
      return 'Share your unique link and earn XP as explorers join the tides.';
    }
    if (!isWalletConnected) {
      return '🔌 Connect your wallet to generate your referral link.';
    }
    return 'Generating your referral link… refresh if this takes too long.';
  };

  return (
    <Page>
      <div className="section referral-wrapper">
        <h1 className="referral-title">🧬 Invite the Shellborn</h1>
        <p className="referral-sub">
          Earn XP as your friends explore the Seven Isles of Tides.
        </p>

        {/* Wallet status pill */}
        <div className="wallet-section" style={{ marginBottom: 24 }}>
          <span className="wallet-status">
            <WalletStatus />
          </span>
        </div>

        <p className="referral-info">{renderIntroText()}</p>

        {referralCode ? (
          <>
            <div className="referral-box">
              <p><strong>Your Referral Link:</strong></p>
              <div className="referral-input-group">
                <input value={referralLink} readOnly />
                <button onClick={handleCopy}>
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>

            <div className="referral-rewards">
              <h2>🏅 Rewards</h2>
              <ul>
                <li>+50 XP for each referred explorer</li>
                <li>Tier 2: +10% XP bonus</li>
                <li>Tier 3: +25% XP bonus</li>
              </ul>
            </div>

            <div className="referral-list">
              <h2>🌊 Your Explorers</h2>
              {referrals.length === 0 ? (
                <div className="glass-strong" style={{ padding: 16, borderRadius: 12 }}>
                  <p style={{ margin: 0 }}>
                    No referrals yet — share your link to start earning bonuses. When
                    friends join, they will appear here with their join date and XP.
                  </p>
                  <button className="btn ghost" style={{ marginTop: 12 }} onClick={handleCopy}>
                    Copy my invite link
                  </button>
                </div>
              ) : (
                <ul>
                  {referrals.map((r, i) => (
                    <li key={i}>
                      {shorten(r.wallet || r.address)}
                      {r.joinedAt && (
                        <> – {new Date(r.joinedAt).toLocaleDateString()}</>
                      )}
                      {typeof r.xp === 'number' && (
                        <> – {r.xp} XP</>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="referral-share">
              <h2>📢 Share & Earn</h2>
              <button
                className="share-btn"
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?text=Join%207GoldenCowries!%20${encodeURIComponent(
                      referralLink
                    )}`,
                    '_blank'
                  )
                }
              >
                🐦 Share on Twitter
              </button>
              <button
                className="share-btn"
                onClick={() =>
                  window.open(
                    `https://t.me/share/url?url=${encodeURIComponent(
                      referralLink
                    )}&text=Join%207GoldenCowries!`,
                    '_blank'
                  )
                }
              >
                📣 Share on Telegram
              </button>
            </div>
          </>
        ) : (
          <div className="glass-strong" style={{ padding: 18, borderRadius: 14 }}>
            <p style={{ marginBottom: 6 }}>
              You need a wallet-connected profile before we can generate your referral link.
            </p>
            <p className="muted" style={{ marginBottom: 12 }}>
              Connect your TON wallet and refresh this page to create a shareable invite.
            </p>
            <WalletStatus />
          </div>
        )}
      </div>
    </Page>
  );
};

export default Referral;

function shorten(addr = '') {
  if (!addr) return '';
  if (addr.length <= 10) return addr;
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}
