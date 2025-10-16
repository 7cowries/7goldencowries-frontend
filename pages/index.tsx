import WalletConnect from "../src/components/WalletConnect";
import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>7GoldenCowries — Sail the Seven Isles</title>
        <meta name="description" content="Complete quests, earn XP, climb tiers, and unlock partner perks across the Seven Isles." />
        <meta property="og:title" content="7GoldenCowries" />
        <meta property="og:description" content="Sail the Seven Isles — complete quests, earn XP, and unlock perks." />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
</Head>

      <main style={{
        minHeight: "100vh",
        background: "#0b2240",
        color: "#e7e7ff",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      }}>
        <div style={{maxWidth: 1100, margin: "0 auto", padding: "3rem 1.25rem"}}>
          <header style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:16}}>
            <h1 style={{margin:0, fontSize:"clamp(28px, 5vw, 44px)"}}>
              7<span style={{color:"#A7F3D0"}}>Golden</span>Cowries
            </h1>
            <nav style={{display:"flex", gap:12}}>
              <Link href="/isles">Isles</Link>
              <Link href="/quests">Quests</Link>
              <Link href="/profile">Profile</Link>
            </nav>
          </header>

          <section style={{marginTop: "3rem", display:"grid", gap: "1.5rem"}}>
            <h2 style={{fontSize:"clamp(22px, 4vw, 34px)", margin:"0 0 .5rem"}}>
              Sail the Seven Isles
            </h2>
            <p style={{maxWidth: 720, lineHeight: 1.6, margin:0}}>
              Complete quests, earn XP, climb tiers, and unlock partner perks. Connect your wallet,
              join seasonal events, and grow your legend across the Isles.
            </p>

            <div style={{display:"flex", flexWrap:"wrap", gap:12, marginTop:"1rem"}}>
              <Link href="/isles" style={cta("solid")}>Explore Isles</Link>
              <Link href="/quests" style={cta("ghost")}>Start Quests</Link>
            </div>
          </section>

          <section style={{marginTop:"3rem", display:"grid", gap:"1rem"}}>
            <h3 style={{margin:0}}>Coming Innovations</h3>
            <div style={{
              display:"grid",
              gap:"1rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))"
            }}>
              <Card title="GigiP2Bot" text="A Telegram bot that feels human. Connect your wallets, trade, and earn with natural chat." />
              <Card title="MaxEng"  text="Telegram companion for memberships, campaigns, and provable actions on-chain." />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function cta(variant:"solid"|"ghost") {
  return {
    padding: ".7rem 1rem",
    borderRadius: 10,
    textDecoration: "none",
    border: "1px solid #94A3B8",
    color: variant === "solid" ? "#0b2240" : "#e7e7ff",
    background: variant === "solid" ? "#A7F3D0" : "transparent",
    fontWeight: 600
  } as React.CSSProperties;
}

function Card({title, text}:{title:string; text:string}) {
  return (
    <div style={{
      border:"1px solid #1f355a",
      borderRadius:16,
      padding:"1rem",
      background:"rgba(255,255,255,0.02)"
    }}>
      <div style={{fontWeight:700, marginBottom:.5}}>{title}</div>
      <p style={{margin:0, opacity:.9, lineHeight:1.5}}>{text}</p>
    </div>
  );
}
