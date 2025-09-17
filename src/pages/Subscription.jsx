import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Page from "../components/Page";
import WalletConnect from "../components/WalletConnect";
import XPModal from "../components/XPModal";
import PaymentGuard from "../components/PaymentGuard";
import { useWallet } from "../hooks/useWallet";
import {
  getMe,
  getSubscriptionStatus,
  subscribeToTier,
  tierMultiplier,
  claimSubscriptionBonus,
} from "../utils/api";
import "./Subscription.css";
import "../App.css";

const tiersUSD = [
  {
    name: "Free",
    usd: 0,
    boost: "No boost",
    xp: 0,
    benefits: ["Access to basic quests", "Earn base XP"],
    tierKey: "free",
  },
  {
    name: "Tier 1",
    usd: 2,
    boost: "+10% XP Boost",
    xp: 100,
    benefits: ["Unlock premium quests", "Priority support"],
    tierKey: "tier1",
  },
  {
    name: "Tier 2",
    usd: 5,
    boost: "+25% XP Boost",
    xp: 250,
    benefits: ["Early access quests", "Referral bonuses"],
    tierKey: "tier2",
  },
  {
    name: "Tier 3",
    usd: 10,
    boost: "+50% XP Boost",
    xp: 500,
    benefits: ["Top leaderboard bonus", "Cowrie NFT Badge"],
    tierKey: "tier3",
  },
];

export default function SubscriptionPage() {
  const { wallet, isConnected } = useWallet();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tonPrice, setTonPrice] = useState(null);
  const [currentTier, setCurrentTier] = useState("free");
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");
  const [nextRenewal, setNextRenewal] = useState(null);
  const [level, setLevel] = useState("Shellborn");
  const [xpModalOpen, setXPModalOpen] = useState(false);
  const [recentXP, setRecentXP] = useState(0);
  const [pendingTier, setPendingTier] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("info");
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [error, setError] = useState("");
  const [canClaimBonus, setCanClaimBonus] = useState(false);
  const [claimingBonus, setClaimingBonus] = useState(false);
  const abortRef = useRef(null);
  const toastTimerRef = useRef(null);

  const showMessage = useCallback((text, tone = "info", autoHide = false) => {
    setMessage(text);
    setMessageTone(tone);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    if (autoHide && text) {
      toastTimerRef.current = window.setTimeout(() => {
        setMessage("");
        toastTimerRef.current = null;
      }, 3200);
    }
  }, []);

  useEffect(() => {
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd"
    )
      .then((res) => res.json())
      .then((data) => {
        const price = data["the-open-network"]?.usd;
        if (price) setTonPrice(price);
      })
      .catch((err) => {
        console.error("Failed to fetch TON price:", err);
        setTonPrice(null);
      });
  }, []);

  const loadSubscription = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (!wallet) {
      setCurrentTier("free");
      setSubscriptionStatus("inactive");
      setNextRenewal(null);
      setCanClaimBonus(false);
      setError("");
      return;
    }
    setLoadingSubscription(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const data = await getSubscriptionStatus({ signal: controller.signal });
      const tierValue = (data?.tier || data?.subscriptionTier || "free").toLowerCase();
      setCurrentTier(tierValue);
      const statusValue = (data?.status || data?.state || data?.subscriptionStatus || "active")
        .toString()
        .toLowerCase();
      setSubscriptionStatus(statusValue);
      setNextRenewal(
        data?.nextRenewal ||
          data?.renewalDate ||
          data?.nextBillingDate ||
          data?.renewal ||
          null
      );
      setLevel(data?.levelName || data?.level || "Shellborn");
      setCanClaimBonus(Boolean(data?.canClaim));
      setError("");
    } catch (err) {
      if (err?.name === "AbortError") return;
      const message =
        typeof err?.message === "string" && err.message.toLowerCase().includes("failed to fetch")
          ? "Network error: Failed to fetch"
          : err?.message || "Failed to load subscription details.";
      setError(message);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setLoadingSubscription(false);
    }
  }, [wallet]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  useEffect(() => () => {
    abortRef.current?.abort();
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    if (!wallet) {
      setLevel("Shellborn");
      return () => {
        active = false;
      };
    }
    getMe({ force: true })
      .then((data) => {
        if (!active || !data) return;
        setLevel(data?.levelName || data?.level || "Shellborn");
        if (data?.subscriptionTier) {
          setCurrentTier(String(data.subscriptionTier).toLowerCase());
        }
      })
      .catch((err) => {
        console.warn("[Subscription] profile fetch failed", err);
      });
    return () => {
      active = false;
    };
  }, [wallet]);

  useEffect(() => {
    const onProfileUpdated = () => {
      loadSubscription();
    };
    window.addEventListener("profile-updated", onProfileUpdated);
    return () => {
      window.removeEventListener("profile-updated", onProfileUpdated);
    };
  }, [loadSubscription]);

  const statusParam = searchParams.get("status");
  useEffect(() => {
    if (!statusParam) return;
    if (statusParam === "success") {
      showMessage("Subscription confirmed! Welcome to your new tier.", "success", true);
      loadSubscription();
    } else if (statusParam === "cancel") {
      showMessage("Checkout cancelled. You can try again any time.", "warn", true);
    } else if (statusParam === "error") {
      showMessage(
        "We could not verify the subscription session. Please try again.",
        "error"
      );
    }
    setSearchParams({}, { replace: true });
  }, [statusParam, setSearchParams, showMessage, loadSubscription]);

  const normalizedTier = useMemo(() => {
    const key = String(currentTier || "").toLowerCase();
    const match = tiersUSD.find(
      (tier) => tier.tierKey === key || tier.name.toLowerCase() === key
    );
    return match?.tierKey || key || "free";
  }, [currentTier]);

  const activeTier = useMemo(
    () => tiersUSD.find((tier) => tier.tierKey === normalizedTier),
    [normalizedTier]
  );

  const displayTier = activeTier?.name || (currentTier ? String(currentTier) : "Free");
  const mult = tierMultiplier(displayTier);
  const walletShort = wallet ? `${wallet.slice(0, 4)}…${wallet.slice(-4)}` : "";

  const renewalLabel = useMemo(() => {
    if (!nextRenewal) return "—";
    const parsed = new Date(nextRenewal);
    if (Number.isNaN(parsed.getTime())) return nextRenewal;
    return parsed.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [nextRenewal]);

  const statusLabel = useMemo(() => {
    if (!isConnected) return "Wallet disconnected";
    if (!subscriptionStatus) return "Inactive";
    const readable = subscriptionStatus.replace(/_/g, " ");
    return readable.charAt(0).toUpperCase() + readable.slice(1);
  }, [subscriptionStatus, isConnected]);

  const handleSubscribe = async (tier) => {
    if (!wallet) {
      showMessage("Connect your wallet to pick a tier.", "warn", true);
      return;
    }
    const targetKey = tier.tierKey;
    if (targetKey === normalizedTier) {
      showMessage("You are already on this tier.", "info", true);
      return;
    }
    setPendingTier(targetKey);
    showMessage("");
    try {
      const res = await subscribeToTier({ wallet, tier: targetKey });
      if (res?.sessionUrl) {
        window.location.href = res.sessionUrl;
        return;
      }
      setRecentXP(tier.xp);
      setXPModalOpen(true);
      await loadSubscription();
      showMessage(`Subscription updated to ${tier.name}.`, "success", true);
    } catch (err) {
      showMessage(err?.message || "Failed to start subscription.", "error");
    } finally {
      setPendingTier("");
    }
  };

  const handleClaimBonus = useCallback(async () => {
    if (claimingBonus) return;
    if (!wallet) {
      showMessage("Connect your wallet to claim the bonus.", "warn", true);
      return;
    }
    setClaimingBonus(true);
    setError("");
    try {
      const res = await claimSubscriptionBonus();
      const status = (res && res.status) || {};
      const gained = Number(res?.xpDelta ?? res?.xp ?? 0);
      setCanClaimBonus(Boolean(status.canClaim ?? res?.canClaim));
      if (gained > 0) {
        setRecentXP(gained);
        setXPModalOpen(true);
        showMessage(`+${gained} XP earned 🎉`, "success", true);
      } else {
        showMessage("Bonus already claimed.", "info", true);
      }
      await Promise.all([
        loadSubscription(),
        getMe({ force: true }).catch(() => null),
      ]);
    } catch (err) {
      const message =
        typeof err?.message === "string" && err.message.toLowerCase().includes("failed to fetch")
          ? "Network error: Failed to fetch"
          : err?.message || "Claim failed";
      setError(message);
    } finally {
      setClaimingBonus(false);
    }
  }, [claimingBonus, wallet, loadSubscription, showMessage]);

  return (
    <Page>
      <div className="section subscription-wrapper fade-in">
        <h1 className="subscription-title text-glow">🌊 Your Subscription</h1>

        <div className="wallet-section">
          <WalletConnect />
          <span className="wallet-status">
            {isConnected ? `Connected: ${walletShort}` : "Wallet disconnected"}
          </span>
        </div>

        {message && <div className={`subscription-alert ${messageTone}`}>{message}</div>}
        {error && <div className="subscription-alert error">{error}</div>}

        <div className="subscription-card gradient-border hover">
          <img
            src={`/images/badges/level-${level.toLowerCase().replace(/\s+/g, "-")}.png`}
            alt={`Badge for ${level}`}
            className="subscription-badge"
          />
          <div className="subscription-details">
            <p>
              <strong>Level:</strong> {level}
            </p>
            <p>
              <strong>Subscription Tier:</strong> {displayTier}
            </p>
          </div>
        </div>

        <p className="muted">
          Your XP boost: <strong>+{(mult * 100 - 100).toFixed(0)}%</strong>
        </p>

        <div className="subscription-info card">
          <h2>📜 Subscription Details</h2>
          <ul>
            <li>
              <strong>Duration:</strong> 1 Month
            </li>
            <li>
              <strong>Next Renewal:</strong> {renewalLabel}
            </li>
            <li>
              <strong>Status:</strong> {loadingSubscription ? "Loading…" : statusLabel}
            </li>
          </ul>
          <div style={{ marginTop: 16 }}>
            <PaymentGuard
              loadingFallback={<p style={{ marginBottom: 12 }}>Checking subscription status…</p>}
            >
              <>
                <button
                  className="btn"
                  onClick={handleClaimBonus}
                  disabled={!canClaimBonus || claimingBonus || !isConnected}
                >
                  {claimingBonus
                    ? "Working…"
                    : canClaimBonus && isConnected
                    ? "Claim Subscription XP Bonus"
                    : "Bonus Already Claimed"}
                </button>
                {!canClaimBonus ? (
                  <p className="muted" style={{ marginTop: 8 }}>
                    Bonus available once per subscription cycle.
                  </p>
                ) : null}
              </>
            </PaymentGuard>
          </div>
        </div>

        <h2 className="tier-title text-glow">💎 Choose Your Tier</h2>
        <div className="tier-container">
          {tiersUSD.map((tier) => {
            const tonEquivalent = tonPrice ? (tier.usd / tonPrice).toFixed(2) : "…";
            const isActive = tier.tierKey === normalizedTier;
            const isPending = pendingTier === tier.tierKey;
            return (
              <div key={tier.tierKey} className="tier-card">
                {isActive && <div className="active-ribbon">Active</div>}
                <h3>{tier.name}</h3>
                <p className="tier-price">
                  ${tier.usd}
                  {" "}
                  {tonPrice ? `(~${tonEquivalent} TON)` : ""}
                </p>
                <p className="tier-boost">{tier.boost}</p>
                <ul>
                  {tier.benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
                <button
                  className={`subscribe-btn ${isActive ? "active" : ""}`}
                  disabled={isActive || isPending}
                  onClick={() => handleSubscribe(tier)}
                >
                  {isActive
                    ? "Active"
                    : isPending
                    ? "Redirecting…"
                    : isConnected
                    ? "Subscribe"
                    : "Connect to Subscribe"}
                </button>
              </div>
            );
          })}
        </div>

        {xpModalOpen && (
          <XPModal xpGained={recentXP} onClose={() => setXPModalOpen(false)} />
        )}
      </div>
    </Page>
  );
}
