import React, { useEffect, useState } from 'react';
import { getQuests, claimQuest, getMe } from '../lib/api';
import Toast from '../components/Toast';
import ProfileWidget from '../components/ProfileWidget';

export default function Quests() {
  const [quests, setQuests] = useState([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const q = await getQuests();
        setQuests(q.quests || q || []);
      } catch (e) {
        setToast(e.message || 'Failed to load quests');
        setTimeout(() => setToast(''), 3000);
      }
    })();
  }, []);

  const handleClaim = async (id) => {
    try {
      const res = await claimQuest(id);
      setToast(res?.alreadyClaimed ? 'Already claimed' : 'Quest claimed');
      await getMe();
    } catch (e) {
      setToast(e.message || 'Failed to claim');
    } finally {
      setTimeout(() => setToast(''), 3000);
    }
  };

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
            <button onClick={() => handleClaim(q.id)} style={{ marginLeft: 8 }}>
              Claim
            </button>
          </li>
        ))}
      </ul>
      <Toast message={toast} />
    </div>
  );
}

