import React, { useCallback, useState } from "react";
import Page from "../components/Page";
import PaymentGuard from "../components/PaymentGuard";
import WalletStatus from "@/components/WalletStatus";
import useWallet from "../hooks/useWallet";
import { startTokenSalePurchase } from "../utils/api";
import ConnectWalletPrompt from "../components/ConnectWalletPrompt";

export default function TokenSalePage() {
  const { wallet, isConnected } = useWallet();
  const isWalletConnected = !!wallet;

  const [amountUsd, setAmountUsd] = useState("250");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("info");

  const setNotice = useCallback((text, tone = "info") => {
    setMessage(text || "");
    setMessageTone(tone);
  }, []);

  const handleChangeAmount = (e) => {
    setAmountUsd(e.target.value);
  };

  const handlePurchase = useCallback(async () => {
    const value = Number(amountUsd);

    if (!isWalletConnected) {
      setNotice("Connect your wallet before proceeding to payment.", "warn");
      return;
    }
    if (!value || Number.isNaN(value) || value <= 0) {
      setNotice("Enter a valid USD amount greater than 0.", "warn");
      return;
    }

    setSubmitting(true);
    setNotice("");

    try {
      // Payload is generic; backend can read amount + wallet
      const res = await startTokenSalePurchase({
        amountUsd: value,
        wallet,
      });

      // If backend returns a checkout / redirect URL, follow it
      if (res && res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }

      // Otherwise just show a friendly notice
      setNotice(
        res && res.message
          ? res.message
          : "Token sale request received. If nothing happened, the first wave might not be live yet.",
        "info"
      );
    } catch (err) {
      setNotice(
        err?.message || "Failed to start token sale payment. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }, [amountUsd, wallet, isWalletConnected, setNotice]);

  return (
    <Page>
      <div className="section token-sale-wrapper fade-in">
        <h1 className="token-sale-title text-glow">$GCT — Golden Cowrie Token</h1>

        {/* Wallet pill at the top */}
        <div className="wallet-section">
          <span className="wallet-status">
            <WalletStatus />
          </span>
        </div>

        {!isWalletConnected && (
          <ConnectWalletPrompt message="Connect your TON wallet to reserve your $GCT allocation." />
        )}

        <div className="token-sale-hero gradient-border hover">
          <div className="token-sale-hero-content">
            <p className="token-wave-pill">First Wave • Oct 4, 2025 (UTC)</p>
            <p className="token-sale-blurb">
              Forged from the Seven Isles, $GCT powers quests, boosts XP, unlocks premium paths,
              and grants a voice in shaping new tides. No purchase here—just the story, the vision,
              and the countdown.
            </p>
            <h2 className="token-sale-subtitle">🌊 The First Wave Has Begun</h2>
            <p className="token-sale-copy">
              Follow updates in-app and on socials—waves are moving.
            </p>
            <div className="token-sale-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  try {
                    if ("Notification" in window) {
                      // just a graceful placeholder
                      new Notification("Reminder set for the first $GCT wave.");
                    }
                  } catch {
                    // ignore
                  }
                }}
              >
                Set Reminder
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  const shareText =
                    "Reserve your wave in the $GCT — Golden Cowrie Token sale at 7goldencowries.com/token-sale 🌊";
                  const shareUrl = "https://7goldencowries.com/token-sale";
                  if (navigator.share) {
                    navigator
                      .share({ title: "$GCT — Golden Cowrie Token", text: shareText, url: shareUrl })
                      .catch(() => {});
                  } else {
                    navigator.clipboard
                      ?.writeText(`${shareText} ${shareUrl}`)
                      .catch(() => {});
                    alert("Invite link copied to clipboard.");
                  }
                }}
              >
                Invite a Friend
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className={`subscription-alert ${messageTone}`} style={{ marginTop: 16 }}>
            {message}
          </div>
        )}

        <div className="token-sale-card gradient-border hover">
          <h2 className="token-sale-card-title">Reserve Wave 1 Allocation</h2>
          <p className="token-sale-card-text">
            Enter the USD amount you wish to allocate. You&apos;ll be redirected to our payment
            partner to complete checkout.
          </p>

          <label className="token-sale-label">
            Amount (USD)
            <input
              type="number"
              min="1"
              step="1"
              value={amountUsd}
              onChange={handleChangeAmount}
              className="token-sale-input"
              placeholder="250"
            />
          </label>

          <PaymentGuard
            loadingFallback={
              <p style={{ marginTop: 16 }}>
                Checking wallet and payment status…
              </p>
            }
          >
            <button
              type="button"
              className="btn btn-primary token-sale-submit"
              disabled={submitting || !isWalletConnected}
              onClick={isWalletConnected ? handlePurchase : undefined}
            >
              {submitting
                ? "Processing…"
                : isWalletConnected
                ? "Proceed to Payment"
                : "Connect wallet to continue"}
            </button>
          </PaymentGuard>
        </div>

        <div className="token-sale-why gradient-border">
          <h2 className="token-sale-card-title">Why $GCT?</h2>
          <ul className="token-sale-list">
            <li>
              ⚡ <strong>Quest Power</strong>: Boost XP multipliers and unlock insider quests.
            </li>
            <li>
              👑 <strong>Prestige</strong>: Access premium tiers & story arcs across the Seven Isles.
            </li>
            <li>
              🌐 <strong>Voice</strong>: Help steer the tides of 7GoldenCowries governance.
            </li>
          </ul>
        </div>
      </div>
    </Page>
  );
}
