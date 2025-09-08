import React, { useState } from 'react';

export default function QuestCard({ quest, onClaim, claiming }) {
  const [proofUrl, setProofUrl] = useState('');
  const claimed = quest.completed || quest.claimed;
  const handleClaim = () => onClaim(quest.id, proofUrl);
  return (
    <div className="card quest-card">
      <p className="quest-title">
        {quest.url ? (
          <a className="link-underline" href={quest.url} target="_blank" rel="noopener noreferrer">
            {quest.title || quest.id}
          </a>
        ) : (
          quest.title || quest.id
        )}
      </p>
      <input
        type="url"
        placeholder="Paste proof link (optional)"
        value={proofUrl}
        onChange={(e) => setProofUrl(e.target.value)}
        className="proof-input"
      />
      <button className="btn" disabled={claiming || claimed} onClick={handleClaim}>
        {claimed ? 'Claimed' : claiming ? 'Claiming…' : 'Claim'}
      </button>
    </div>
  );
}
