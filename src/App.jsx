import React from "react";
import { Routes, Route } from "react-router-dom";
import { TonConnectUIProvider } from "./hooks/safeTon";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Quests from "./pages/Quests";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Isles from "./pages/Isles";
import Referral from "./pages/Referral";
import Subscription from "./pages/Subscription";
import TokenSale from "./pages/TokenSale";
import Theme from "./pages/Theme";

const manifestUrl =
  process.env.REACT_APP_TONCONNECT_MANIFEST_URL ||
  process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL ||
  (typeof window !== "undefined"
    ? `${window.location.origin}/tonconnect-manifest.json`
    : "/tonconnect-manifest.json");

export default function App() {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/token-sale" element={<TokenSale />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/isles" element={<Isles />} />
          <Route path="/theme" element={<Theme />} />
        </Routes>
      </Layout>
    </TonConnectUIProvider>
  );
}
