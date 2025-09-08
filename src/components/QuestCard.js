import React, { useState } from 'react';
import { submitProof, tierMultiplier } from '../utils/api';

export default function QuestCard({ quest, onClaim, onProof, claiming, me }) {
  const q = quest;
  const req = String(q.requirement || '').toLowerCase();
  const needsProof = req && req !== 'none';
  const alreadyClaimed = q.completed || q.alreadyClaimed || q.claimed;
  const claimable = !alreadyClaimed && (!needsProof || q.proofStatus === 'approved');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const mult = tierMultiplier(me?.tier || me?.subscriptionTier);
  const projected = Math.round((q.xp || 0) * mult);

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
        ) : q.type ? (
          <span className={`chip ${q.type}`}>
            {q.type.charAt(0).toUpperCase() + q.type.slice(1)}
          </span>
        ) : null}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {alreadyClaimed ? (
              <span className="chip completed">✅ Completed</span>
            ) : q.proofStatus === 'pending' ? (
              <span className="chip pending">🕒 Pending review</span>
            ) : null}
            <span className="xp-badge">
              +{q.xp} XP{mult > 1 ? (
                <span className="muted" style={{ marginLeft: 6 }}>
                  (×{mult.toFixed(2)} ≈ {projected})
                </span>
              ) : null}
            </span>
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

      {/* Inline proof input (Twitter/Telegram/Discord/link) */}
      {!alreadyClaimed && needsProof && (
        <div className="inline-proof" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={
              req === 'join_telegram' || req === 'telegram'
                ? 'Paste Telegram message/channel link'
                : req === 'join_discord' || req === 'discord'
                ? 'Paste Discord invite/message link'
                : req === 'tweet' || req === 'retweet' || req === 'quote' || req === 'tweet_link'
                ? 'Paste tweet/retweet/quote link'
                : 'Paste link here'
            }
            className="input"
            style={{ flex: 1, minWidth: 220 }}
          />
          <button
            className="btn primary"
            disabled={submitting || !url}
            onClick={async () => {
              if (!url) return;
              setSubmitting(true);
              try {
                const res = await submitProof(q.id, { url });
                // Optimistic: reflect backend decision
                if (res?.status) q.proofStatus = res.status;
                window.dispatchEvent(new Event('profile-updated'));
              } catch (e) {
                alert(e?.message || 'Failed to submit proof');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitting ? 'Submitting…' : 'Submit proof'}
          </button>
        </div>
      )}

        <div className="q-actions">
          {alreadyClaimed ? (
            <button className="btn success" disabled>
              Claimed
            </button>
          ) : (
            <button
              className="btn ghost"
              onClick={() => onClaim(q.id)}
              disabled={claiming || !claimable}
              title={!claimable && needsProof ? 'Submit proof first' : ''}
            >
              {claiming ? 'Claiming...' : 'Claim'}
            </button>
          )}
          {q.url ? (
            <a className="btn primary" href={q.url} target="_blank" rel="noopener noreferrer">Go</a>
          ) : null}
        </div>
    </div>
  );
}
