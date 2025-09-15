// src/pages/Subscription.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Subscription.css";
import Page from "../components/Page";
import "../App.css";
import XPModal from "../components/XPModal";
import WalletConnect from "../components/WalletConnect";
import {
  getMe,
  getSubscription,
  subscribeToTier,
  tierMultiplier,
} from "../utils/api";
import { useWallet } from "../hooks/useWallet";

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

const Subscription = () => {
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

  const showMessage = useCallback((text, tone = "info") => {
    setMessage(text);
    setMessageTone(tone);
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
    if (!wallet) {
      setCurrentTier("free");
      setSubscriptionStatus("inactive");
      setNextRenewal(null);
      return;
    }
    setLoadingSubscription(true);
    try {
      const data = await getSubscription();
      const tierValue = (data?.tier || data?.subscriptionTier || "free").toLowerCase();
      setCurrentTier(tierValue);
      setSubscriptionStatus((data?.status || data?.state || "active").toLowerCase());
      setNextRenewal(data?.nextRenewal || data?.renewalDate || data?.nextBillingDate || null);
      setError("");
    } catch (err) {
      setError(err?.message || "Failed to load subscription details.");
    } finally {
      setLoadingSubscription(false);
    }
  }, [wallet]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  useEffect(() => {
    let active = true;
    if (!wallet) {
      setLevel("Shellborn");
      return;
    }
    getMe({ force: true })
      .then((data) => {
        if (!active) return;
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

  const statusParam = searchParams.get("status");
  useEffect(() => {
    if (!statusParam) return;
    if (statusParam === "success") {
      showMessage("Subscription confirmed! Welcome to your new tier.", "success");
      loadSubscription();
    } else if (statusParam === "cancel") {
      showMessage("Checkout cancelled. You can try again any time.", "warn");
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
      showMessage("Connect your wallet to pick a tier.", "warn");
      return;
    }
    const targetKey = tier.tierKey;
    if (targetKey === normalizedTier) {
      showMessage("You are already on this tier.", "info");
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
      showMessage(`Subscription updated to ${tier.name}.`, "success");
    } catch (err) {
      showMessage(err?.message || "Failed to start subscription.", "error");
    } finally {
      setPendingTier("");
    }
  };

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

        {message && (
          <div className={`subscription-alert ${messageTone}`}>{message}</div>
        )}
        {error && <div className="subscription-alert error">{error}</div>}

        <div className="subscription-card gradient-border hover">
          <img
            src={`/images/badges/level-${level
              .toLowerCase()
              .replace(/\s+/g, "-")}.png`}
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
        </div>

        <h2 className="tier-title text-glow">💎 Choose Your Tier</h2>
        <div className="tier-container">
          {tiersUSD.map((tier) => {
            const tonEquivalent = tonPrice
              ? (tier.usd / tonPrice).toFixed(2)
              : "…";
            const isActive = tier.tierKey === normalizedTier;
            const isPending = pendingTier === tier.tierKey;
            return (
              <div key={tier.tierKey} className="tier-card">
                {isActive && <div className="active-ribbon">Active</div>}
                <h3>{tier.name}</h3>
                <p className="tier-price">
                  ${tier.usd}{" "}
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
          <XPModal
            xpGained={recentXP}
            onClose={() => setXPModalOpen(false)}
          />
        )}
      </div>
    </Page>
  );
};

export default Subscription;
