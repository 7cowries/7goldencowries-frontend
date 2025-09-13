import React, { useRef } from 'react';
import useTilt from '../fx/useTilt';
import { tierMultiplier } from '../utils/api';
import ProofInput from './ProofInput';

export default function QuestCard({ quest, onClaim, claiming, me, setToast }) {
  const q = quest;
  const needsProof = q.requirement && q.requirement !== 'none';
  const alreadyClaimed = q.completed || q.alreadyClaimed || q.claimed;
  const claimable = !alreadyClaimed && (!needsProof || q.proofStatus === 'approved');
  const mult = tierMultiplier(me?.tier || me?.subscriptionTier);
  const projected = Math.round((q.xp || 0) * mult);
  const cardRef = useRef(null);
  useTilt(cardRef, 8);

  return (
    <div ref={cardRef} className="glass glass-card quest-card fade-in">
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
        <ProofInput
          questId={q.id}
          requirement={q.requirement}
          setToast={setToast}
          onSubmitted={() => {
            q.proofStatus = 'pending';
          }}
        />
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
