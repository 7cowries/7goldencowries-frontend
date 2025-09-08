import React, { useState, useRef } from 'react';
import useTilt from '../fx/useTilt';
import { submitProof, tierMultiplier } from '../utils/api';

export default function QuestCard({ quest, onClaim, claiming, me, setToast }) {
  const q = quest;
  const needsProof = q.requirement && q.requirement !== 'none';
  const alreadyClaimed = q.completed || q.alreadyClaimed || q.claimed;
  const claimable = !alreadyClaimed && (!needsProof || q.proofStatus === 'approved');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const mult = tierMultiplier(me?.tier || me?.subscriptionTier);
  const projected = Math.round((q.xp || 0) * mult);
  const cardRef = useRef(null);
  useTilt(cardRef, 8);

  return (
    <div ref={cardRef} className="glass quest-card fade-in">
      <div className="q-row">
        {q.type ? (
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
            +{q.xp} XP
            {mult > 1 ? (
              <span className="muted" style={{ marginLeft: 6 }}>
                (×{mult.toFixed(2)} ≈ {projected})
              </span>
            ) : null}
          </span>
        </div>
      </div>
      <p className="quest-title" style={{ color: 'var(--ink)' }}>
        {q.url ? (
          <a
            href={q.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {q.title || q.id}
          </a>
        ) : (
          q.title || q.id
        )}
      </p>
      {q.url ? (
        <div className="muted mono" style={{ color: 'var(--ink-soft)' }}>
          {q.url}
        </div>
      ) : null}

      {/* Inline proof input (only when required and not completed) */}
      {!alreadyClaimed && needsProof && (
        <div className="inline-proof" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={
              q.requirement === 'join_telegram' ? 'Paste Telegram message/channel link' :
              q.requirement === 'join_discord'  ? 'Paste Discord invite/message link' :
              (q.requirement === 'tweet' || q.requirement === 'retweet' || q.requirement === 'quote')
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
                q.proofStatus = res?.status || 'pending'; // optimistic
                setToast?.('Proof submitted');
                setTimeout(() => setToast?.(''), 3000);
                window.dispatchEvent(new Event('profile-updated'));
              } catch (e) {
                setToast?.(e?.message || 'Failed to submit proof');
                setTimeout(() => setToast?.(''), 3000);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      )}

      <div className="q-actions">
        {alreadyClaimed ? (
          <button className="btn success" disabled>Claimed</button>
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
      </div>
    </div>
  );
}
