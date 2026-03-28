import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Quests from "./pages/Quests";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Isles from "./pages/Isles";
import Referral from "./pages/Referral";
import Subscription from "./pages/Subscription";
import TokenSale from "./pages/TokenSale";
import Staking from "./pages/Staking";
import ThemeSettings from "./pages/ThemeSettings";
import Arenas from "./pages/Arenas";
import ArenaDetail from "./pages/ArenaDetail";
import ArenaPaymentStatus from "./pages/ArenaPaymentStatus";
import Partners from "./pages/Partners";
import AdminArenaConsole from "./pages/AdminArenaConsole";
import useAccess from "./hooks/useAccess";
import RefRedirect from "./pages/RefRedirect";
import NotFound from "./pages/NotFound";

function AdminRoute({ children }) {
  const { isAdmin, loading } = useAccess();

  if (loading) {
    return <div className="glass-strong" style={{ padding: 20 }}>Checking permissions…</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
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
        <Route path="/staking" element={<Staking />} />
        <Route path="/theme" element={<ThemeSettings />} />
        <Route path="/arenas" element={<Arenas />} />
        <Route path="/arenas/:arenaId" element={<ArenaDetail />} />
        <Route path="/arena-payment-status" element={<ArenaPaymentStatus />} />
        <Route path="/payment-return" element={<ArenaPaymentStatus />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/ref/:code" element={<RefRedirect />} />
        <Route path="/referrals" element={<Navigate to="/referral" replace />} />
        <Route
          path="/admin/arena-console"
          element={
            <AdminRoute>
              <AdminArenaConsole />
            </AdminRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
