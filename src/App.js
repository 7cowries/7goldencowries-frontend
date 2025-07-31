import React, { useEffect, useState } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';
import './Quests.css';

const API = process.env.REACT_APP_API_URL;

const Quests = () => {
  const wallet = useTonWallet();
  const [quests, setQuests] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [xp, setXp] = useState(0);
  const [tier, setTier] = useState('');
  const [progress, setProgress] = useState(0);
  const [nextXP, setNextXP] = useState(100);
  const [levelName, setLevelName] = useState('Shellborn');

  useEffect(() => {
    if (!wallet?.account?.address) return;

    fetch(`${API}/users/${wallet.account.address}`)
      .then(res => res.json())
      .then(data => {
        setXp(data.xp);
        setTier(data.tier);
        setProgress(data.levelProgress);
        setNextXP(data.nextXP);
        setLevelName(data.levelName);
      });

    fetch(`${API}/quests`)
      .then(res => res.json())
      .then(setQuests);

    fetch(`${API}/completed/${wallet.account.address}`)
      .then(res => res.json())
      .then(data => setCompleted(data.completed || []));
  }, [wallet]);

  const completeQuest = async (id) => {
    const res = await fetch(`${API}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: wallet.account.address, questId: id })
    });

    const result = await res.json();
    if (res.ok) {
      alert(result.message || '+XP!');
      setCompleted(prev => [...prev, id]);
    } else {
      alert(result.error || 'Failed to complete quest');
    }
  };

  return (
    <div className="quests-wrapper">
      <h1 className="section-title">🧾 Quests</h1>

      {wallet?.account?.address ? (
        <>
          <div className="profile-bar">
            <p><strong>Wallet:</strong> {wallet.account.address}</p>
            <p><strong>XP:</strong> {xp} | <strong>{tier}</strong></p>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${(progress * 100).toFixed(1)}%` }}></div>
            </div>
            <p className="progress-label">{xp} / {nextXP} XP to next virtue</p>
          </div>

          <ul className="quest-list">
            {quests.map(q => (
              <li key={q.id} className={completed.includes(q.id) ? 'quest done' : 'quest'}>
                <h3>{q.title}</h3>
                <p>🪙 {q.xp} XP</p>
                <a href={q.url} target="_blank" rel="noreferrer">
                  <button className="go-btn">🌐 Go</button>
                </a>
                <button
                  className="complete-btn"
                  disabled={completed.includes(q.id)}
                  onClick={() => completeQuest(q.id)}
                >
                  ✅ Complete
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="connect-message">🔌 Connect your wallet to begin questing</p>
      )}
    </div>
  );
};

export default Quests;
