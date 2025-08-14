/* global BigInt */
import React, { useMemo, useState } from 'react';
import { TonConnectButton, useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { QRCodeCanvas } from 'qrcode.react';
import './TokenSale.css';

const SALE_ADDRESS =
  process.env.REACT_APP_TON_SALE_ADDRESS ||
  'UQDeBauP14FBpDmzFJIOHlWb4ncZO7Y0Bv4P_xiF0w_pmpHvb'; // <- replace with your real address

const BACKEND =
  process.env.REACT_APP_API_URL || 'http://localhost:5000';

function toNanoStr(amountTon) {
  const n = Number.parseFloat(amountTon || '0');
  if (!Number.isFinite(n) || n <= 0) return '0';
  // TON uses nanotons (10^9)
  return window.BigInt(Math.round(n * 1e9)).toString();
}

export default function TokenSale() {
  const [amount, setAmount] = useState('2'); // default to 2 TON for demo
  const [referral, setReferral] = useState('');
  const [memo, setMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const amountNano = useMemo(() => toNanoStr(amount), [amount]);

  // Deep link fallback for Tonkeeper/Tonhub/Telegram wallet
  const deeplink = useMemo(() => {
    const base = `ton://transfer/${SALE_ADDRESS}`;
    const params = new URLSearchParams();
    if (amountNano !== '0') params.set('amount', amountNano);
    const text = memo || 'GCT contribution';
    if (text) params.set('text', text);
    return `${base}?${params.toString()}`;
  }, [amountNano, memo]);

  const copy = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const handleConnect = async () => {
    try {
      await tonConnectUI.openModal(); // opens TonConnect modal (QR on desktop)
    } catch (e) {
      alert('Could not open TON wallet. Try a different wallet app.');
      console.error(e);
    }
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Enter a valid TON amount.');
      return;
    }

    try {
      setSubmitting(true);

      // 1) record the intent server-side (optional but recommended)
      await fetch(`${BACKEND}/token-sale/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountTON: Number.parseFloat(amount),
          referral: referral || null,
          memo: memo || null
        })
      }).catch(() => {});

      // 2) build TonConnect transfer
      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        messages: [
          {
            address: SALE_ADDRESS,
            amount: amountNano
            // If you want to add text payload in TonConnect, use base64 payload (commented)
            // payload: <base64 BOC>,
          }
        ]
      };

      // 3) if user is connected, send via TonConnect
      if (wallet) {
        const result = await tonConnectUI.sendTransaction(tx);
        console.log('TonConnect result:', result);
        alert('Thanks! Please confirm the transaction in your wallet.');
        return;
      }

      // 4) if not connected, try opening the modal
      try {
        await tonConnectUI.openModal();
      } catch (err) {
        console.warn('Modal open failed, falling back to deeplink.');
      }

      // 5) still provide deep link fallback for wallets that don’t support TonConnect
      window.open(deeplink, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error(e);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="section sale-section">
        <div className="sale-header">
          <h1>🟡 Golden Cowrie Token Sale</h1>
          <TonConnectButton />
        </div>

        <div className="sale-grid">
          <div className="sale-form">
            <label>Sale Address</label>
            <div className="row">
              <input value={SALE_ADDRESS} readOnly />
              <button className="btn" onClick={() => copy(SALE_ADDRESS)}>Copy</button>
            </div>

            <label>Amount (TON)</label>
            <input
              inputMode="decimal"
              placeholder="e.g. 12.5"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <div className="row mt">
              <button className="btn outline" onClick={handleConnect}>
                {wallet ? 'Wallet Connected' : 'Connect TON Wallet'}
              </button>
              <button className="btn primary" disabled={submitting} onClick={handleSubmit}>
                {submitting ? 'Submitting…' : 'Submit Contribution'}
              </button>
            </div>

            <label>Referral (optional)</label>
            <input
              placeholder="wallet or code"
              value={referral}
              onChange={(e) => setReferral(e.target.value)}
            />

            <label>Memo / Note (optional)</label>
            <input
              placeholder="e.g. my @handle"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />

            <p className="hint">
              Submitting records your intent (amount, referral, memo) and opens your TON wallet with exact
              transfer details. Make sure the address matches before sending.
            </p>
          </div>

          <div className="sale-summary">
            <div className="qr-card">
              <QRCodeCanvas value={deeplink} size={220} includeMargin />
            </div>

            <div className="summary-lines">
              <div className="line">
                <span>TON</span>
                <strong>{Number.parseFloat(amount || '0').toFixed(2)}</strong>
              </div>
              <div className="line">
                <span>Memo—</span>
                <strong>{memo || '—'}</strong>
              </div>
              <div className="line">
                <span>Referral—</span>
                <strong>{referral || '—'}</strong>
              </div>
            </div>

            <a className="deeplink" href={deeplink}>
              ton://transfer… (deeplink)
            </a>
            <small className="tiny">
              Tonhub, or tap the link on mobile.
            </small>
          </div>
        </div>

        <div className="sale-about">
          <h3>About Golden Cowries</h3>
          <p>
            In our myth of discovery, the Golden Cowrie Token (<strong>$GCT</strong>) fuels the quest of ancient
            explorers across the Seven Isles. Those who believe, contribute. Those who contribute, become part of the myth.
          </p>
        </div>
      </div>
    </div>
  );
}
