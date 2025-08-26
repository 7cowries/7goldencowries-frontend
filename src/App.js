// src/App.js
import React, { useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

import LeftNav from "./components/LeftNav";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

// 🔊 sound bootstrapping + global click SFX
import {
  enableAmbientSound,
  resumeAmbientIfNeeded,
  soundIsEnabled,
  attachGlobalClickSFX,
} from "./utils/sounds";

/** Lazy routes for faster first paint */
const Landing      = lazy(() => import("./pages/Landing"));
const Quests       = lazy(() => import("./pages/Quests"));
const Leaderboard  = lazy(() => import("./pages/Leaderboard"));
const Referral     = lazy(() => import("./pages/Referral"));
const Subscription = lazy(() => import("./pages/Subscription"));
const TokenSale    = lazy(() => import("./pages/TokenSale"));
const Profile      = lazy(() => import("./pages/Profile"));
const Isles        = lazy(() => import("./pages/Isles"));
const NotFound     = lazy(() => import("./pages/NotFound")); // make sure this file exists

/** Ambient background layers (veil + orbs) */
function AmbientLayers() {
  return (
    <>
      <div className="veil" />
      <div id="magic-orbs">
        <div className="orb" />
        <div className="orb" />
        <div className="orb" />
        <div className="orb" />
      </div>
    </>
  );
}

const App = () => {
  useEffect(() => {
    // Global click sound for all pages, once.
    attachGlobalClickSFX();

    // Arm ambient on first explicit user gesture (autoplay policies).
    const arm = () => {
      if (soundIsEnabled()) enableAmbientSound();
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
    window.addEventListener("pointerdown", arm);
    window.addEventListener("keydown", arm);

    // Resume after tab visibility changes
    const vis = () => resumeAmbientIfNeeded();
    document.addEventListener("visibilitychange", vis);

    return () => {
      document.removeEventListener("visibilitychange", vis);
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
  }, []);

  return (
    <TonConnectUIProvider manifestUrl="https://7cowries.github.io/7goldencowries-connect/tonconnect-manifest.json">
      <ErrorBoundary>
        <Router>
          <AmbientLayers />
          <div className="app-layout">
            <LeftNav />
            <main className="main-view">
              <Suspense fallback={<div className="section">Loading…</div>}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/quests" element={<Quests />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/referral" element={<Referral />} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/token-sale" element={<TokenSale />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/isles" element={<Isles />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </Router>
      </ErrorBoundary>
    </TonConnectUIProvider>
  );
};

export default App;
