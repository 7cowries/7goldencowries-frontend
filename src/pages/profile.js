// src/pages/profile.js
import useWalletSession from "@/hooks/useWalletSession";

export default function ProfilePage() {
  const { me, sub, loading, connectWallet } = useWalletSession();

  if (loading) return <div style={{padding:20}}>Loading…</div>;

  return (
    <main style={{padding:24, maxWidth:800, margin:"0 auto"}}>
      <h1>Profile</h1>
      <div style={{marginTop:12}}>
        <div><b>Wallet:</b> {me?.wallet || me?.address || "Not connected"}</div>
        <div><b>Tier:</b> {sub?.tier || "Free"}</div>
        <div><b>Active:</b> {sub?.active ? "Yes" : "No"}</div>
        <div><b>XP Boost:</b> {sub?.xpBoost ?? 1}×</div>
      </div>
      {!me?.wallet && (
        <button
          style={{marginTop:16, padding:"8px 14px", borderRadius:10}}
          onClick={() =>
            connectWallet("UQCFcijJkLSyX-PMvC3fDHgIImrX14kX29XQ0R0G08yabakC")
          }
        >
          Connect Wallet (test)
        </button>
      )}
    </main>
  );
}
