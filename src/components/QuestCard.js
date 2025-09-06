import React from 'react';

const NEEDS_PROOF = new Set([
  'twitter_follow',
  'twitter_retweet',
  'twitter_quote',
  'telegram_join',
  'discord_join',
  'link',
]);

export default function QuestCard({ quest, onClaim, onProof, claiming }) {
  const q = quest;
  const needsProof = NEEDS_PROOF.has(q.requirement);
  const claimable = q.completed || q.proofStatus === 'approved';
  return (
    <div className="glass quest-card">
      <div className="q-row">
        {q.type === 'link' ? (
          q.url ? (
            <a
              href={q.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`chip ${q.type}`}
              onClick={(e) => e.stopPropagation()}
            >
              Link
            </a>
          ) : (
            <span className={`chip ${q.type}`}>Link</span>
          )
        ) : (
          <span className={`chip ${q.type}`}>
            {q.type?.charAt(0).toUpperCase() + q.type?.slice(1)}
          </span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {typeof q.proofStatus === 'string' && (
            <span className={`chip ${q.proofStatus}`}>
              {q.proofStatus.charAt(0).toUpperCase() + q.proofStatus.slice(1)}
            </span>
          )}
          <span className="xp-badge">+{q.xp} XP</span>
        </div>
      </div>
      <p className="quest-title">
        {q.url ? (
          <a
            href={q.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (process.env.NODE_ENV !== 'production') {
                console.log('quest_opened', q.id);
              }
              e.stopPropagation();
            }}
          >
            {q.title || q.id}
          </a>
        ) : (
          q.title || q.id
        )}
      </p>
      {q.url ? (
        <div className="muted mono" style={{ wordBreak: 'break-all' }}>
          {q.url}
        </div>
      ) : null}
      <div className="actions">
        {q.url && (
          <a
            className="btn primary"
            href={q.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (process.env.NODE_ENV !== 'production') {
                console.log('quest_opened', q.id);
              }
            }}
          >
            Go
          </a>
        )}
        {needsProof && (
          <button
            className="btn primary"
            onClick={() => onProof(q)}
            disabled={claiming}
          >
            Submit proof
          </button>
        )}
        {q.alreadyClaimed || q.claimed ? (
          <button className="btn success" disabled>
            Claimed
          </button>
        ) : (
          <button
            className="btn ghost"
            onClick={() => onClaim(q.id)}
            disabled={claiming || !claimable}
          >
            {claiming ? 'Claiming...' : 'Claim'}
          </button>
        )}
      </div>
    </div>
  );
}
