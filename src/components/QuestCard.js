import React, { useState, useRef } from 'react';
import useTilt from '../fx/useTilt';
import { submitProof, tierMultiplier } from '../utils/api';

const PROOF_REQUIRED = 'proof-required';
const TOAST_RESET_MS = process.env.NODE_ENV === 'test' ? 0 : 3000;

export default function QuestCard({
  quest,
  onClaim,
  claiming,
  me,
  setToast,
  canClaim = true,
  blockedReason,
  onProofStatusChange,
}) {
  const q = quest;
  const baseNeedsProof = q.requirement && q.requirement !== 'none';
  const needsProof = baseNeedsProof || blockedReason === PROOF_REQUIRED;
  const alreadyClaimed = q.completed || q.alreadyClaimed || q.claimed;
  const proofStatus = String(q.proofStatus || q.proof_status || '').toLowerCase();
  const claimable =
    !alreadyClaimed && (!baseNeedsProof || proofStatus === 'approved');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const mult = tierMultiplier(me?.tier || me?.subscriptionTier);
  const projected = Math.round((q.xp || 0) * mult);
  const cardRef = useRef(null);
  useTilt(cardRef, 8);
  const isBlocked = Boolean(blockedReason);
  const proofBlocked = blockedReason === PROOF_REQUIRED;
  const blockedTooltip = proofBlocked
    ? 'Submit proof before claiming'
    : blockedReason || '';
  const proofNoteId = `proof-note-${q.id}`;
  const buttonDisabled = claiming || !claimable || !canClaim || isBlocked;

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
            ) : proofStatus === 'pending' ? (
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
                const status = String(res?.status || 'pending').toLowerCase();
                q.proofStatus = status; // optimistic
                onProofStatusChange?.({ questId: q.id, status });
                setToast?.('Proof submitted');
                setTimeout(() => setToast?.(''), TOAST_RESET_MS);
                window.dispatchEvent(new Event('profile-updated'));
              } catch (e) {
                setToast?.(e?.message || 'Failed to submit proof');
                setTimeout(() => setToast?.(''), TOAST_RESET_MS);
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
          <>
            {isBlocked && proofBlocked ? (
              <p id={proofNoteId} className="muted proof-note" role="note">
                Proof required — submit your link above.
              </p>
            ) : null}
            <button
              className="btn ghost"
              onClick={() => onClaim?.(q)}
              disabled={buttonDisabled}
              title={
                !canClaim
                  ? 'Connect wallet to claim'
                  : proofBlocked
                  ? blockedTooltip
                  : isBlocked
                  ? blockedTooltip
                  : !claimable && needsProof
                  ? 'Submit proof first'
                  : ''
              }
              aria-disabled={buttonDisabled}
              aria-describedby={proofBlocked ? proofNoteId : undefined}
            >
              {claiming ? 'Claiming...' : 'Claim'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
