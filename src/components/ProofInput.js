import React, { useState } from 'react';
import { submitProof, claimQuest } from '../utils/api';

/**
 * Reusable proof submission input.
 * Sends the user's wallet, vendor and url to the backend then
 * automatically attempts to claim the quest.
 */
export default function ProofInput({ questId, requirement, setToast, onSubmitted }) {
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const placeholders = {
    join_telegram: 'Paste Telegram message/channel link',
    join_discord: 'Paste Discord invite/message link',
    tweet: 'Paste tweet link',
    retweet: 'Paste retweet link',
    quote: 'Paste quote link',
    tweet_link: 'Paste tweet link',
    default: 'Paste link here'
  };

  const placeholder = placeholders[requirement] || placeholders.default;

  const handle = async () => {
    const wallet = localStorage.getItem('wallet');
    if (!wallet || !url) return;
    setSubmitting(true);
    try {
      await submitProof(questId, { wallet, vendor: 'link', url });
      await claimQuest(questId);
      setToast?.('Proof submitted');
      setTimeout(() => setToast?.(''), 3000);
      onSubmitted?.();
    } catch (e) {
      setToast?.(e?.message || 'Failed to submit proof');
      setTimeout(() => setToast?.(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="inline-proof" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={placeholder}
        className="input"
        style={{ flex: 1, minWidth: 220 }}
      />
      <button className="btn primary" disabled={submitting || !url} onClick={handle}>
        {submitting ? 'Submitting…' : 'Submit'}
      </button>
    </div>
  );
}
