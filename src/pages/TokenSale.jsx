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
      setNotice({ text: "Connect your wallet before starting payment.", tone: "warn" });
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
          "Purchase intent created, but no checkout URL was returned. Contact support if this persists.",
        tone: "warn",
      });
    } catch (err) {
      setNotice({ text: err?.message || "Unable to start payment.", tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }, [isWalletConnected, numericAmount, wallet]);

  return (
    <Page>
      <section className="section ts-hero">
        <div className="ts-hero-head">
          <h1>$GCT Token Sale</h1>
          <span className="ts-badge">Payment-enabled flow</span>
        </div>
        <p className="subtitle ts-hero-sub">
          Review sale status, enter your desired allocation, and continue through secure checkout.
        </p>
        <div className="wallet-section" style={{ marginTop: 16 }}>
          <WalletStatus />
        </div>
      </section>

      <section className="section ts-purchase">
        <h2>Start purchase</h2>
        <p className="muted">This route uses /api/v1/token-sale/purchase and expects a checkoutUrl response.</p>

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
              {submitting ? "Starting checkout…" : "Proceed to payment"}
            </button>
          </PaymentGuard>
        </div>

        {notice.text && <p className={`subscription-alert ${notice.tone}`} style={{ marginTop: 14 }}>{notice.text}</p>}
      </section>

      <section className="section ts-faq">
        <h2>Before you pay</h2>
        <ul className="ts-bullets">
          <li>Use a wallet you control and keep it connected until checkout opens.</li>
          <li>After payment, return here through the payment status route to confirm settlement.</li>
          <li>If checkout does not open, backend may be missing provider configuration.</li>
        </ul>
      </section>
    </Page>
  );
}
