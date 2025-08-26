// src/pages/Subscription.js
import React, { useState, useEffect } from "react";
import "./Subscription.css";
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import XPModal from "../components/XPModal";
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

const Subscription = () => {
  const [tonConnectUI] = useTonConnectUI();
  const connectedWallet = useTonWallet();
  const walletAddress = connectedWallet?.account?.address;
  const walletConnected = !!walletAddress;

  const [currentTier, setCurrentTier] = useState("Free");
  const [level, setLevel] = useState("Shellborn");
  const [billingDate] = useState("Aug 21, 2025");
  const [tonPrice, setTonPrice] = useState(null);

  const [xpModalOpen, setXPModalOpen] = useState(false);
  const [recentXP, setRecentXP] = useState(0);

  useEffect(() => {
    // Fetch TON price
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

    // Fetch user tier + level
    if (walletConnected) {
      fetch(`http://localhost:5000/users/${walletAddress}`)
        .then((res) => res.json())
        .then((data) => {
          setCurrentTier(data.tier || "Free");
          setLevel(data.levelName || "Shellborn");
        })
        .catch((e) => console.error("User fetch failed:", e));
    }
  }, [walletAddress, walletConnected]);

  const subscribeToTier = (tier, tonEquivalent) => {
    if (!walletConnected) {
      alert("Please connect your TON wallet.");
      return;
    }
    if (tier.name === currentTier) {
      alert("You are already on this tier.");
      return;
    }

    const tx = {
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: [
        {
          address: "UQDeBauPI4FBpDmzFJIoHWB4ncZO7Y0Bv4P_XifOw_pmpHvb",
          amount: Math.floor(tonEquivalent * 1e9).toString(), // nanoTON
        },
      ],
    };

    tonConnectUI.sendTransaction(tx);

    // Show XP modal instantly
    setRecentXP(tier.xp);
    setXPModalOpen(true);

    // Persist on backend
    fetch("http://localhost:5000/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet: walletAddress,
        tier: tier.name,
        ton: tonEquivalent,
        usd: tier.usd,
      }),
    }).catch((e) => console.error("Subscribe failed:", e));

    setCurrentTier(tier.name);
  };

  return (
    <div className="page">
      <div className="section subscription-wrapper fade-in">
        <h1 className="subscription-title text-glow">🌊 Your Subscription</h1>

        {/* Wallet connect */}
        <div className="wallet-section">
          <TonConnectButton />
          {walletConnected && (
            <span className="wallet-status">Wallet Connected</span>
          )}
        </div>

        {/* Current subscription card */}
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
              <strong>Subscription Tier:</strong> {currentTier}
            </p>
          </div>
        </div>

        {/* Info panel */}
        <div className="subscription-info card">
          <h2>📜 Subscription Details</h2>
          <ul>
            <li>
              <strong>Duration:</strong> 1 Month
            </li>
            <li>
              <strong>Next Billing Date:</strong> {billingDate}
            </li>
            <li>
              <strong>Status:</strong> Active
            </li>
          </ul>
        </div>

        {/* Tiers */}
        <h2 className="tier-title text-glow">💎 Choose Your Tier</h2>
        <div className="tier-container">
          {tiersUSD.map((tier) => {
            const tonEquivalent = tonPrice
              ? (tier.usd / tonPrice).toFixed(2)
              : "…";

            const isActive = tier.name === currentTier;

            return (
              <div key={tier.tierKey} className="tier-card">
                {isActive && (
                  <div className="active-ribbon">Active</div>
                )}
                <h3>{tier.name}</h3>
                <p className="tier-price">
                  ${tier.usd}{" "}
                  {tonPrice ? `(~${tonEquivalent} TON)` : ""}
                </p>
                <p className="tier-boost">{tier.boost}</p>
                <ul>
                  {tier.benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
                <button
                  className={`subscribe-btn ${
                    isActive ? "active" : ""
                  }`}
                  disabled={isActive || !tonPrice}
                  onClick={() =>
                    subscribeToTier(tier, parseFloat(tonEquivalent))
                  }
                >
                  {isActive ? "Active" : "Subscribe"}
                </button>
              </div>
            );
          })}
        </div>

        {/* XP Modal */}
        {xpModalOpen && (
          <XPModal
            xpGained={recentXP}
            onClose={() => setXPModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Subscription;
