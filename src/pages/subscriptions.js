// src/pages/subscriptions.js
import { useState } from "react";
import useWalletSession from "@/hooks/useWalletSession";
import { upsertSubscription, tierMultiplier } from "@/utils/api";

const TIERS = [
  { name: "Free",  btn: null, boost: 1 },
  { name: "Tier 1", btn: "Subscribe Tier 1", boost: 1.10 },
  { name: "Tier 2", btn: "Subscribe Tier 2", boost: 1.25 },
  { name: "Tier 3", btn: "Subscribe Tier 3", boost: 1.50 },
];

export default function SubscriptionsPage() {
  const { me, sub, loading, refresh } = useWalletSession();
  const [busy, setBusy] = useState(false);
  const wallet = me?.wallet || me?.address;

  const doSubscribe = async (tier) => {
    if (!wallet) return alert("Connect wallet on Profile first.");
    setBusy(true);
    try {
      await upsertSubscription({ tier, provider: "TON", tx_id: `ui-${Date.now()}` });
      await refresh();
      alert(`Activated ${tier}.`);
    } catch (e) {
      console.error(e);
      alert("Failed to subscribe.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div style={{padding:20}}>Loading…</div>;

  return (
    <main style={{padding:24, maxWidth:980, margin:"0 auto"}}>
      <h1>Subscriptions</h1>
      <p style={{opacity:.8}}>Wallet: {wallet || "not connected"}</p>

      <section style={{display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))"}}>
        {TIERS.map(t => {
          const active = (sub?.tier||"Free").toLowerCase() === t.name.toLowerCase();
          return (
            <div key={t.name} style={{border:"1px solid #1e3a5f", padding:16, borderRadius:14}}>
              <h3>{t.name}</h3>
              <p>XP boost: {t.boost}×</p>
              {t.btn ? (
                <button
                  disabled={busy || active}
                  onClick={() => doSubscribe(t.name)}
                  style={{marginTop:8, padding:"8px 12px", borderRadius:10, opacity:(busy||active)?0.6:1}}
                >
                  {active ? "Current Plan" : t.btn}
                </button>
              ) : (
                <p style={{opacity:.7}}>Free plan</p>
              )}
            </div>
          );
        })}
      </section>

      <div style={{marginTop:20}}>
        <b>Current:</b> {sub?.tier || "Free"} • Active: {sub?.active ? "Yes" : "No"} • Boost: {tierMultiplier(sub?.tier)}×
      </div>
    </main>
  );
}
