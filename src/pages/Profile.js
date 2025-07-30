import React, { useEffect, useState } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';
import './Profile.css';

const API = process.env.REACT_APP_API_URL;

const Profile = () => {
  const wallet = useTonWallet();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState({ name: '', symbol: '', progress: 0, nextXP: 100 });
  const [tier, setTier] = useState('Free');
  const [twitter, setTwitter] = useState('');
  const [history, setHistory] = useState([]);
  const [perk, setPerk] = useState('');

  const perks = {
    'Shellborn': 'Welcome badge + access to basic quests',
    'Wave Seeker': 'Retweet quests unlocked',
    'Tide Whisperer': 'Quote tasks and bonus XP',
    'Current Binder': 'Leaderboard rank & Telegram quests',
    'Pearl Bearer': 'Earn referral bonuses + badge',
    'Isle Champion': 'Access secret quests and lore',
    'Cowrie Ascendant': 'Unlock hidden realm + max power 🐚✨'
  };

  useEffect(() => {
    if (!wallet?.account?.address) return;

    fetch(`${API}/users/${wallet.account.address}`)
      .then(res => res.json())
      .then(data => {
        setXp(data.xp || 0);
        setTier(data.tier || 'Free');
        setLevel({
          name: data.levelName || 'Unranked',
          symbol: data.levelSymbol || '🐚',
          progress: data.levelProgress || 0,
          nextXP: data.nextXP || 100
        });
        setTwitter(data.twitterHandle || '🔗 Not linked');
        setPerk(perks[data.levelName] || '');
      });

    fetch(`${API}/journal/${wallet.account.address}`)
      .then(res => res.json())
      .then(data => setHistory(data.journal || []))
      .catch(console.error);
  }, [wallet]);

  const connectTwitter = () => {
    if (!wallet?.account?.address) return alert("Connect wallet first");
    const encoded = btoa(wallet.account.address);
    window.location.href = `${API}/auth/twitter?state=${encoded}`;
  };

  return (
    <div className="profile-wrapper">
      <h1 className="section-title">🌟 Explorer Profile</h1>

      {wallet?.account?.address ? (
        <>
          <div className="profile-card">
            <div className="profile-left">
              <img
                className="level-badge"
                src={`/images/badges/level-${level.name?.toLowerCase().replace(/\s+/g, '-')}.png`}
                alt={level.name}
                onError={(e) => e.target.src = '/images/badges/unranked.png'}
              />
              <p className="perk"><strong>🎁 Perk:</strong> {perk || '—'}</p>
            </div>

            <div className="profile-info">
              <p><strong>Wallet:</strong> {wallet.account.address.slice(0, 6)}...{wallet.account.address.slice(-4)}</p>
              <p><strong>Twitter:</strong> {twitter}</p>
              <p><strong>Subscription:</strong> {tier}</p>
              <p><strong>Level:</strong> {level.name} {level.symbol}</p>
              <p><strong>XP:</strong> {xp} / {level.nextXP || '∞'}</p>

              <div className="xp-bar">
                <div
                  className="xp-fill"
                  style={{ width: `${(level.progress * 100).toFixed(1)}%`, transition: 'width 0.8s ease-in-out' }}
                ></div>
              </div>
              <p className="progress-label">{(level.progress * 100).toFixed(1)}% to next virtue</p>

              <div className="connect-buttons">
                <button className="connect-btn" onClick={connectTwitter}>🐦 Connect X (Twitter)</button>
                <button className="connect-btn" onClick={() => window.open('https://t.me/yourtelegram', '_blank')}>📣 Connect Telegram</button>
                <button className="connect-btn" onClick={() => window.open('https://discord.gg/yourdiscord', '_blank')}>🎮 Connect Discord</button>
              </div>
            </div>
          </div>

          <div className="history">
            <h2>📜 Quest History</h2>
            {history.length === 0 ? (
              <p>No quests completed yet.</p>
            ) : (
              <ul>
                {history.map((q, i) => (
                  <li key={i}>
                    <strong>{q.title}</strong> — +{q.xp} XP<br />
                    <span className="timestamp">{new Date(q.timestamp).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <p>🔌 Connect your wallet to view your profile.</p>
      )}
    </div>
  );
};

export default Profile;

