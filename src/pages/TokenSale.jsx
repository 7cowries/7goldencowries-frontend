import React, { useCallback, useMemo, useState } from "react";
import Page from "../components/Page";
import PaymentGuard from "../components/PaymentGuard";
import WalletStatus from "@/components/WalletStatus";
import useWallet from "../hooks/useWallet";
import { startTokenSalePurchase } from "../utils/api";

export default function TokenSalePage() {
  const { wallet } = useWallet();
  const isWalletConnected = !!wallet;

  const [amountUsd, setAmountUsd] = useState("250");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ text: "", tone: "info" });

  const numericAmount = useMemo(() => Number(amountUsd), [amountUsd]);

  const handlePurchase = useCallback(async () => {
    if (!isWalletConnected) {
      setNotice({ text: "Connect your wallet before starting checkout.", tone: "warn" });
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setNotice({ text: "Enter a valid amount in USD.", tone: "warn" });
      return;
    }

    setSubmitting(true);
    setNotice({ text: "", tone: "info" });

    try {
      const res = await startTokenSalePurchase({ amountUsd: numericAmount, wallet });
      if (res?.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }

      setNotice({
        text:
          res?.message ||
          "Checkout is not available right now. Please try again later or contact support.",
        tone: "warn",
      });
    } catch (err) {
      setNotice({
        text: err?.message || "Unable to start token sale checkout.",
        tone: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }, [isWalletConnected, numericAmount, wallet]);

  return (
    <Page>
      <section className="section ts-hero">
        <div className="ts-hero-head">
          <h1>$GCT Token Sale</h1>
          <span className="ts-badge">Wave access</span>
        </div>
        <p className="subtitle ts-hero-sub">
          Review the current wave, choose your intended allocation, and continue to secure checkout
          when payment infrastructure is available.
        </p>
        <div className="wallet-section" style={{ marginTop: 16 }}>
          <WalletStatus />
        </div>
      </section>

      <section className="section ts-purchase">
        <h2>Start token purchase</h2>
        <p className="muted">
          This action creates a purchase intent through <code>/api/v1/token-sale/purchase</code>. If
          no checkout URL is returned, the page will surface that state clearly.
        </p>

        <div className="ts-form">
          <label>
            Amount (USD)
            <input
              type="number"
              min="1"
              step="1"
              value={amountUsd}
              onChange={(e) => setAmountUsd(e.target.value)}
              placeholder="250"
            />
          </label>

          <PaymentGuard loadingFallback={<p>Checking payment access…</p>}>
            <button className="btn" onClick={handlePurchase} disabled={submitting || !isWalletConnected}>
              {submitting ? "Starting checkout…" : "Proceed to checkout"}
            </button>
          </PaymentGuard>
        </div>

        {notice.text && (
          <p className={`subscription-alert ${notice.tone}`} style={{ marginTop: 14 }}>
            {notice.text}
          </p>
        )}
      </section>

      <section className="section ts-faq">
        <h2>What to expect</h2>
        <ul className="ts-bullets">
          <li>Connect a wallet you control before creating a purchase intent.</li>
          <li>Complete payment in checkout and return to verify final status.</li>
          <li>If checkout is unavailable, integration is incomplete and no purchase is finalized.</li>
        </ul>
      </section>
    </Page>
  );
}
