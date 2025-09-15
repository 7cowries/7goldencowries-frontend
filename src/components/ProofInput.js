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
    tweet: 'Paste tweet/retweet/quote link',
    retweet: 'Paste tweet/retweet/quote link',
    quote: 'Paste tweet/retweet/quote link',
    tweet_link: 'Paste tweet/retweet/quote link',
    default: 'Paste link here'
  };

  const placeholder = placeholders[requirement] || placeholders.default;

  const handle = async (e) => {
    e.preventDefault();
    const wallet = localStorage.getItem('wallet');
    if (!url) return;
    setSubmitting(true);
    try {
      await submitProof(questId, { wallet, vendor: 'link', url });
      await claimQuest(questId);
      setUrl('');
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
    <form className="inline-proof" style={{ display: 'flex', gap: 8, marginTop: 8 }} onSubmit={handle}>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={placeholder}
        className="input"
        style={{ flex: 1, minWidth: 220 }}
      />
      <button type="submit" className="btn primary" disabled={submitting || !url}>
        {submitting ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  );
}
