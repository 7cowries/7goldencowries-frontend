import React, { useEffect, useRef, useState } from 'react';
import { getQuests, claimQuest } from '../lib/api';
import Toast from '../components/Toast';
import ProfileWidget from '../components/ProfileWidget';

export default function Quests() {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claiming, setClaiming] = useState({});
  const [toast, setToast] = useState('');
  const walletRef = useRef('');

  const loadQuests = async () => {
    try {
      const q = await getQuests(walletRef.current);
      setQuests(q.quests || q || []);
    } catch (e) {
      setError(e.message || 'Failed to load quests');
    }
  };

  useEffect(() => {
    const syncWallet = async () => {
      walletRef.current = localStorage.getItem('wallet') || '';
      await loadQuests();
    };

    // initial load
    syncWallet().finally(() => setLoading(false));

    // refresh if wallet changes (even in another tab)
    const onStorage = (e) => {
      if (e.key === 'wallet') syncWallet();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleClaim = async (id) => {
    setClaiming((c) => ({ ...c, [id]: true }));
    try {
      const res = await claimQuest(walletRef.current, id);
      setToast(res?.alreadyClaimed ? 'Already claimed' : 'Quest claimed');
      await loadQuests();
    } catch (e) {
      setToast(e.message || 'Failed to claim');
    } finally {
      setClaiming((c) => ({ ...c, [id]: false }));
      setTimeout(() => setToast(''), 3000);
    }
  };

  if (loading) return <p>Loading quests...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: 16 }}>
      <ProfileWidget />
      <h1>Quests</h1>
      <ul>
        {quests.map((q) => (
          <li key={q.id} style={{ marginBottom: 8 }}>
            <strong>{q.title || q.id}</strong>{' '}
            <em>{q.type}</em>{' '}
            <span style={{ marginLeft: 8 }}>+{q.xp} XP</span>
            {q.alreadyClaimed || q.claimed ? (
              <span style={{ marginLeft: 8 }}>Claimed</span>
            ) : (
              <button
                onClick={() => handleClaim(q.id)}
                disabled={!!claiming[q.id]}
                style={{ marginLeft: 8 }}
              >
                {claiming[q.id] ? 'Claiming...' : 'Claim'}
              </button>
            )}
          </li>
        ))}
      </ul>
      <Toast message={toast} />
    </div>
  );
}
