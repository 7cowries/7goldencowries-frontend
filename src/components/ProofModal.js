import React, { useEffect, useState } from 'react';
import { submitProof, getProofStatus } from '../utils/api';
import { normalizeTweetUrl } from '../utils/proof';

export default function ProofModal({ quest, wallet, onClose, onVerified }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  if (!quest) return null;

  const validate = (val) => {
    const norm = normalizeTweetUrl(val);
    if (!norm) {
      setError('Invalid tweet URL');
      return null;
    }
    setError('');
    return norm;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const norm = validate(url);
    if (!norm) return;
    setSubmitting(true);
    setReason('');
    try {
      const res = await submitProof(wallet, quest.id, norm);
      if (res?.status === 'verified') {
        onVerified && onVerified();
        onClose();
      } else if (res?.status === 'rejected') {
        setReason(res?.reason || 'Rejected');
      } else {
        setVerifying(true);
      }
    } catch (e) {
      if (e.status === 429) {
        setError('Too many attempts, try again in a minute');
      } else {
        setError('Failed to submit proof');
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    let timer;
    let attempts = 0;
    async function poll() {
      if (cancelled) return;
      attempts++;
      try {
        const res = await getProofStatus(wallet, quest.id);
        if (res?.status === 'verified') {
          setVerifying(false);
          onVerified && onVerified();
          onClose();
          return;
        }
        if (res?.status === 'rejected') {
          setVerifying(false);
          setReason(res?.reason || 'Rejected');
          return;
        }
      } catch {}
      if (attempts * 3000 >= 45000) {
        setVerifying(false);
        return;
      }
      timer = setTimeout(poll, 3000);
    }
    if (verifying) {
      timer = setTimeout(poll, 3000);
    }
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [verifying, wallet, quest, onClose, onVerified]);

  return (
    <div className="modal" onClick={onClose}>
      <div className="glass-strong modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>Submit Proof</h2>
        <p className="muted" style={{ marginBottom: 12 }}>
          Paste a public tweet URL from x.com or twitter.com
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={(e) => validate(e.target.value)}
            placeholder="https://x.com/username/status/1234567890"
            maxLength={500}
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
          {reason && (
            <p className="muted" style={{ color: '#ff8a8a', marginTop: 8 }}>
              {reason}
            </p>
          )}
          {verifying && (
            <p className="muted" style={{ marginTop: 8 }}>Verifying…</p>
          )}
          <div className="actions" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn ghost"
              onClick={onClose}
              disabled={submitting || verifying}
            >
              Cancel
            </button>
            <button
              className="btn primary"
              type="submit"
              disabled={submitting || verifying}
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
