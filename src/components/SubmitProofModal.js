import React, { useState } from 'react';
import { submitProof } from '../utils/api';
import { isValidTweetUrl } from '../utils/validators';

export default function SubmitProofModal({ quest, onClose, onSuccess, onError }) {
  const [url, setUrl] = useState('');
  const vendor = (() => {
    switch (quest?.requirement) {
      case 'tweet':
      case 'retweet':
      case 'quote':
      case 'tweet_link':
        return 'twitter';
      case 'join_telegram':
        return 'telegram';
      case 'join_discord':
        return 'discord';
      default:
        return 'link';
    }
  })();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!quest) return null;

  const placeholders = {
    twitter: 'Paste tweet/retweet/quote link',
    telegram: 'Paste Telegram message/channel link',
    discord: 'Paste Discord invite/message link',
    link: 'Paste link here',
  };

  const handleSubmit = async () => {
    if (!url) {
      setError('URL required');
      return;
    }
    if (vendor === 'twitter' && !isValidTweetUrl(url)) {
      setError('Invalid tweet URL');
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitProof(quest.id, { url });
      onSuccess && onSuccess(res);
      onClose();
    } catch (e) {
      const message = e.message || 'Failed to submit proof';
      setError(message);
      onError && onError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="glass-strong modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>Submit Proof</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={placeholders[vendor]}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(0,0,0,0.2)',
              color: '#eaf2ff',
            }}
          />
        </div>
        {error && (
          <p className="muted" style={{ color: '#ff8a8a', marginTop: 8 }}>
            {error}
          </p>
        )}
        <div className="actions" style={{ marginTop: 16 }}>
          <button className="btn ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className="btn primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
