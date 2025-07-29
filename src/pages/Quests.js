import React, { useEffect, useState, useRef } from 'react';
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import XPModal from '../components/XPModal';

const API = process.env.REACT_APP_API_URL;

const Quests = () => {
  const wallet = useTonWallet();
  const [quests, setQuests] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [xp, setXp] = useState(0);
  const [tier, setTier] = useState('Free');
  const [twitter, setTwitter] = useState(null);
  const [level, setLevel] = useState({ name: '', symbol: '', progress: 0, nextXP: 100 });
  const [balance, setBalance] = useState(0);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [unlocked, setUnlocked] = useState(null);
  const [xpModalOpen, setXPModalOpen] = useState(false);
  const [recentXP, setRecentXP] = useState(0);
  const prevLevel = useRef('');

  const storyByLevel = {
    "Shellborn": "You are born of the tide — a humble shell cast into the unknown.",
    "Wave Seeker": "You chase Naiā’s whispers across moonlit currents.",
    "Tide Whisperer": "You speak the language of the sea — calm, yet unrelenting.",
    "Current Binder": "You bend the water's will and tether the storms within.",
    "Pearl Bearer": "You hold the ancient treasures of virtue within your grasp.",
    "Isle Champion": "You command the isles and carry the sea's legacy.",
    "Cowrie Ascendant": "You have become myth — the legend of the seventh tide."
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/users/${wallet.account.address}`);
      const data = res.data;
      setXp(data.xp);
      setTier(data.tier);
      setTwitter(data.twitterHandle || null);
      setLevel({
        name: data.levelName || 'Unranked',
        symbol: data.levelSymbol || '🐚',
        progress: data.levelProgress || 0,
        nextXP: data.nextXP || 100
      });
      prevLevel.current = data.levelName;
    } catch (err) {
      console.error("Profile fetch failed", err);
    }
  };

  useEffect(() => {
    if (!wallet?.account?.address) return;

    fetchProfile();

    axios.get(`${API}/completed/${wallet.account.address}`)
      .then(res => setCompleted(res.data.completed))
      .catch(console.error);

    axios.get(`${API}/quests`)
      .then(res => setQuests(res.data || []))
      .catch(console.error);

    fetch(`https://tonapi.io/v2/accounts/${wallet.account.address}`)
      .then(res => res.json())
      .then(data => setBalance((data.balance / 1e9).toFixed(2)))
      .catch(console.error);
  }, [wallet]);

  const completeQuest = async (questId, xpGain) => {
    try {
      await axios.post(`${API}/complete`, {
        wallet: wallet.account.address,
        questId
      });

      const res = await axios.get(`${API}/users/${wallet.account.address}`);
      const { xp: newXP, levelName, levelSymbol, levelProgress, nextXP } = res.data;

      setXp(newXP);
      setRecentXP(xpGain);
      setXPModalOpen(true);

      if (levelName !== prevLevel.current) {
        prevLevel.current = levelName;
        setUnlocked({ name: levelName, symbol: levelSymbol });
        setShowLevelModal(true);
      }

      setLevel({ name: levelName, symbol: levelSymbol, progress: levelProgress, nextXP });
      setCompleted(prev => [...prev, questId]);

      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Quest complete error', err);
    }
  };

  return (
    <div style={{
      padding: 24,
      fontFamily: 'Poppins, sans-serif',
      background: 'linear-gradient(to bottom, #001F3F, #FFDC00)',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <TonConnectButton />

      {wallet?.account?.address && (
        <>
          <div style={{ marginTop: 16 }}>
            <p><strong>Wallet:</strong> {wallet.account.address}</p>
            <p><strong>Balance:</strong> {balance} TON</p>
            <p><strong>XP:</strong> {xp} | {level.symbol} {level.name} | {tier}</p>

            <img
              src={`/images/badges/level-${level.name.toLowerCase().replace(/\s+/g, '-')}.png`}
              alt={`${level.name} badge`}
              style={{ height: 80, marginTop: 10 }}
              onError={(e) => { e.target.src = '/images/badges/unranked.png'; }}
            />

            <p style={{ fontStyle: 'italic', marginTop: 10 }}>
              {storyByLevel[level.name] || ''}
            </p>

            <div style={{ background: '#333', borderRadius: 8, overflow: 'hidden', height: 10 }}>
              <div style={{
                width: `${(level.progress * 100).toFixed(1)}%`,
                background: '#FFDC00',
                height: '100%',
                transition: 'width 0.8s ease-in-out'
              }}></div>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#ccc', marginTop: 6 }}>
              {xp} / {level.nextXP || '∞'} XP to next virtue
            </p>
          </div>

          <hr style={{ borderColor: '#FFDC00', margin: '30px 0' }} />
          <h2 style={{ color: '#FFDC00' }}>📜 Quests</h2>
          <p>Click “Go” to complete the task and “Complete” to claim XP:</p>

          {quests.map(q => (
            <div key={q.id} style={{
              backgroundColor: '#003366',
              padding: 16,
              borderRadius: 8,
              marginTop: 16,
              opacity: completed.includes(q.id) ? 0.5 : 1
            }}>
              <p><strong>{q.title}</strong></p>
              <div style={{ marginTop: 10 }}>
                <button
                  onClick={() => window.open(q.url, '_blank')}
                  style={btnStyle}
                >
                  🌐 Go to Quest
                </button>
                <button
                  onClick={() => completeQuest(q.id, q.xp)}
                  disabled={completed.includes(q.id)}
                  style={{ ...btnStyle, marginLeft: 10, backgroundColor: '#00aa00' }}
                >
                  ✅ Complete
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {showLevelModal && unlocked && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2>🎉 Level Up!</h2>
            <img
              src={`/images/badges/level-${unlocked.name.toLowerCase().replace(/\s+/g, '-')}.png`}
              alt={unlocked.name}
              style={{ width: 100, marginBottom: 16 }}
              onError={(e) => {
                e.target.src = '/images/badges/unranked.png';
              }}
            />
            <p>{unlocked.symbol} You’ve unlocked the virtue of <strong>{unlocked.name}</strong>!</p>
            <button onClick={() => setShowLevelModal(false)} style={modalBtn}>Close</button>
          </div>
        </div>
      )}

      {xpModalOpen && (
        <XPModal xpGained={recentXP} onClose={() => setXPModalOpen(false)} />
      )}
    </div>
  );
};

const btnStyle = {
  padding: '10px 16px',
  backgroundColor: '#007acc',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontWeight: 'bold',
  cursor: 'pointer'
};

const modalOverlay = {
  position: 'fixed',
  top: 0, left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const modalBox = {
  background: '#001F3F',
  padding: 32,
  borderRadius: 12,
  color: '#FFDC00',
  textAlign: 'center',
  maxWidth: 400
};

const modalBtn = {
  marginTop: 20,
  backgroundColor: '#FFDC00',
  color: '#001F3F',
  padding: '8px 16px',
  border: 'none',
  borderRadius: 6
};

export default Quests;

