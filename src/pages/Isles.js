import React, { useEffect, useState } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';
import './Isles.css';

const API = process.env.REACT_APP_API_URL;

const isles = [
  { id: 1, name: 'Shellborn Shores', level: 'Shellborn', symbol: '🐚', lore: 'Where the journey begins — a tideborn spirit awakens.' },
  { id: 2, name: 'Waverider Bay', level: 'Wave Seeker', symbol: '🌊', lore: 'Braving the currents, you learn to follow Naiā’s whispers.' },
  { id: 3, name: 'Whispering Tides', level: 'Tide Whisperer', symbol: '💨', lore: 'The sea speaks in secrets only the attuned may hear.' },
  { id: 4, name: 'Binding Currents', level: 'Current Binder', symbol: '⚓', lore: 'Harness the flow, command the depths, bend the tide.' },
  { id: 5, name: 'Pearl Haven', level: 'Pearl Bearer', symbol: '🦪', lore: 'You cradle the sea’s virtue in a shell of unshakable will.' },
  { id: 6, name: 'Isle of Champions', level: 'Isle Champion', symbol: '🏆', lore: 'You’ve conquered trials, earning the sea’s highest honor.' },
  { id: 7, name: 'Ascendant Cowrie', level: 'Cowrie Ascendant', symbol: '👁️', lore: 'You are myth — guardian of the final tide.' }
];

const Isles = () => {
  const wallet = useTonWallet();
  const [level, setLevel] = useState('');
  const [unlocked, setUnlocked] = useState([]);

  useEffect(() => {
    if (!wallet?.account?.address) return;

    fetch(`${API}/users/${wallet.account.address}`)
      .then(res => res.json())
      .then(data => {
        setLevel(data.levelName || '');
        const index = isles.findIndex(i => i.level === data.levelName);
        setUnlocked(isles.slice(0, index + 1));
      })
      .catch(console.error);
  }, [wallet]);

  return (
    <div className="isles-wrapper">
      <h1>🗺️ The Seven Isles of Tides</h1>
      <p className="subtitle">Each isle represents a virtue earned through XP. Explore your path.</p>

      <div className="isle-grid">
        {isles.map((isle) => {
          const isUnlocked = unlocked.find(u => u.id === isle.id);
          return (
            <div key={isle.id} className={`isle-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
              <div className="isle-header">
                <span className="isle-number">Isle {isle.id}</span>
                <span className="isle-status">{isUnlocked ? '🔓' : '🔒'}</span>
              </div>
              <div className="isle-name">{isle.symbol} {isle.name}</div>
              {isUnlocked ? (
                <p className="isle-lore">{isle.lore}</p>
              ) : (
                <p className="isle-locked-note">Level up to reveal this isle.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Isles;

