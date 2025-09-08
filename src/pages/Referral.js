import React, { useEffect, useState } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';
import './Referral.css';
import '../App.css'; // Import layout classes
import { getMe } from '../utils/api';

const API = process.env.REACT_APP_API_URL;

const Referral = () => {
  const wallet = useTonWallet();
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [referralCode, setReferralCode] = useState('');

  const referralLink = referralCode
    ? `${window.location.origin}/?ref=${referralCode}`
    : '';

  // 🌊 Handle /ref/:code URL
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/ref\/(.{20,64})$/);
    if (match?.[1]) {
      localStorage.setItem('referral', match[1]);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Load profile to obtain referral code (session-aware)
  useEffect(() => {
    getMe()
      .then((me) => setReferralCode(me?.referral_code || me?.referralCode || ''))
      .catch((err) => console.error('getMe error:', err));
  }, [wallet]);

  // 🧠 Fetch referrals for this code
  useEffect(() => {
    if (!referralCode) return;

    fetch(`${API}/referrals/${referralCode}`)
      .then((res) => res.json())
      .then((data) => setReferrals(data.referrals || []))
      .catch((err) =>
        console.error('Referral fetch error:', err?.response?.data || err.message || err)
      );
  }, [referralCode]);

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page">
      <div className="section referral-wrapper">
        <h1 className="referral-title">🧬 Invite the Shellborn</h1>
        <p className="referral-sub">Earn XP as your friends explore the Seven Isles of Tides.</p>

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
                <p>No referrals yet. Share your link to get started!</p>
              ) : (
                <ul>
                  {referrals.map((r, i) => (
                    <li key={i}>
                      {r.address} <span className={r.completed ? 'ref-status-complete' : 'ref-status-pending'}>
                        {r.completed ? '✅ joined' : '⏳ pending'}
                      </span>
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
                  window.open(`https://twitter.com/intent/tweet?text=Join%207GoldenCowries!%20${referralLink}`, '_blank')
                }
              >
                🐦 Share on Twitter
              </button>
              <button
                className="share-btn"
                onClick={() =>
                  window.open(`https://t.me/share/url?url=${referralLink}&text=Join%207GoldenCowries!`, '_blank')
                }
              >
                📣 Share on Telegram
              </button>
            </div>
          </>
        ) : (
          <p className="referral-info">🔌 Connect your wallet to generate your referral link.</p>
        )}
      </div>
    </div>
  );
};

export default Referral;
