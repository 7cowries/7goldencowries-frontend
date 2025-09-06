import React, { useState } from 'react';
import { submitQuestProof } from '../utils/api';

export default function ProofModal({ quest, onClose, onSuccess, onError }) {
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!quest) return null;

  const handleSubmit = async () => {
    if (!url) {
      setError('URL required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitQuestProof(quest.id, url);
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
        <p className="muted" style={{ marginBottom: 12 }}>
          Paste the link to your proof here.
        </p>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://x.com/username/status/1234567890"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(0,0,0,0.2)',
            color: '#eaf2ff',
          }}
        />
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
