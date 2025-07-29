import React, { useState, useEffect } from "react";
import "./Subscription.css";
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet
} from "@tonconnect/ui-react";
import XPModal from "../components/XPModal";

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

    if (walletConnected) {
      fetch(`http://localhost:5000/users/${walletAddress}`)
        .then(res => res.json())
        .then(data => {
          setCurrentTier(data.tier || "Free");
          setLevel(data.levelName || "Shellborn");
        });
    }
  }, [walletAddress]);

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
          amount: Math.floor(tonEquivalent * 1e9).toString(),
        },
      ],
    };

    tonConnectUI.sendTransaction(tx);

    // Show XP Modal
    setRecentXP(tier.xp);
    setXPModalOpen(true);

    fetch("http://localhost:5000/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet: walletAddress,
        tier: tier.name,
        ton: tonEquivalent,
        usd: tier.usd
      }),
    });

    setCurrentTier(tier.name);
  };

  return (
    <div className="subscription-wrapper">
      <h1 className="subscription-title">🌊 Your Subscription</h1>

      <div className="wallet-section">
        <TonConnectButton />
      </div>

      <div className="subscription-card">
        <img
          src={`/images/badges/level-${level.toLowerCase().replace(/\s+/g, '-')}.png`}
          alt={`Badge for ${level}`}
          className="subscription-badge"
        />
        <div className="subscription-details">
          <p><strong>Level:</strong> {level}</p>
          <p><strong>Subscription Tier:</strong> {currentTier}</p>
        </div>
      </div>

      <div className="subscription-info">
        <h2>📜 Subscription Details</h2>
        <ul>
          <li><strong>Duration:</strong> 1 Month</li>
          <li><strong>Next Billing Date:</strong> {billingDate}</li>
          <li><strong>Status:</strong> Active</li>
        </ul>
      </div>

      <h2 className="tier-title">💎 Choose Your Tier</h2>
      <div className="tier-container">
        {tiersUSD.map((tier) => {
          const tonEquivalent = tonPrice
            ? (tier.usd / tonPrice).toFixed(2)
            : "…";

          return (
            <div key={tier.tierKey} className="tier-card">
              <h3>{tier.name}</h3>
              <p className="tier-price">
                ${tier.usd} {tonPrice ? `(~${tonEquivalent} TON)` : ""}
              </p>
              <p className="tier-boost">{tier.boost}</p>
              <ul>
                {tier.benefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              <button
                className={`subscribe-btn ${
                  tier.name === currentTier ? "active" : ""
                }`}
                disabled={tier.name === currentTier || !tonPrice}
                onClick={() => subscribeToTier(tier, parseFloat(tonEquivalent))}
              >
                {tier.name === currentTier ? "Active" : "Subscribe"}
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
  );
};

export default Subscription;
