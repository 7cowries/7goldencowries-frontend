import React, { useState } from 'react';
import { submitProof } from '../utils/api';

export default function SubmitProofModal({ quest, onClose, onSuccess, onError }) {
  const [url, setUrl] = useState('');
  const [vendor, setVendor] = useState(() => {
    const req = quest?.requirement || '';
    if (req.includes('twitter')) return 'twitter';
    if (req.includes('telegram')) return 'telegram';
    if (req.includes('discord')) return 'discord';
    return 'link';
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!quest) return null;

  const placeholders = {
    twitter: 'Paste tweet link',
    telegram: 'Paste Telegram post link',
    discord: 'Paste Discord message link',
    link: 'Paste link here',
  };

  const handleSubmit = async () => {
    if (!url) {
      setError('URL required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitProof(quest.id, { url, vendor });
      onSuccess && onSuccess(res.proof);
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
          <select
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(0,0,0,0.2)',
              color: '#eaf2ff',
            }}
          >
            <option value="twitter">Twitter/X</option>
            <option value="telegram">Telegram</option>
            <option value="discord">Discord</option>
            <option value="link">Link</option>
          </select>
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
