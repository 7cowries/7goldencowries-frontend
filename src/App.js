// src/App.js
import React, { useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

import LeftNav from "./components/LeftNav";
import ErrorBoundary from "./components/ErrorBoundary";
import FXCanvas from "./fx/FXCanvas";
import { getEffectsOff } from "./store/effects";
import "./App.css";
import "./styles/polish.css";

// 🔊 Global sound system
import {
  enableAmbientSound,
  resumeAmbientIfNeeded,
  soundIsEnabled,
  attachGlobalClickSFX,
} from "./utils/sounds";
import { API_BASE } from "./utils/api";

const manifestUrl = "/tonconnect-manifest.json";

/* -----------------------------
   Lazy-loaded pages (code split)
----------------------------- */
const Landing      = lazy(() => import("./pages/Landing"));
const Quests       = lazy(() => import("./pages/Quests"));
const Leaderboard  = lazy(() => import("./pages/Leaderboard"));
const Referral     = lazy(() => import("./pages/Referral"));
const Subscription = lazy(() => import("./pages/Subscription"));
const TokenSale    = lazy(() => import("./pages/TokenSale"));
const Profile      = lazy(() => import("./pages/Profile"));
const Isles        = lazy(() => import("./pages/Isles"));
const NotFound     = lazy(() => import("./pages/NotFound"));  // fallback route
const TestAPI      = lazy(() => import("./pages/TestAPI"));   // connectivity check
const RefRedirect  = lazy(() => import("./pages/RefRedirect"));

/* -----------------------------
   Ambient background layers
----------------------------- */
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

/* -----------------------------
   App Component
----------------------------- */
const App = () => {
  const [effectsOff, setEffectsOffState] = React.useState(getEffectsOff());
  React.useEffect(() => {
    const on = () => setEffectsOffState(getEffectsOff());
    window.addEventListener("effects:toggled", on);
    return () => window.removeEventListener("effects:toggled", on);
  }, []);
  useEffect(() => {
    // 1) Attach click sound globally
    attachGlobalClickSFX();

    // 2) Enable ambient sound only after explicit user gesture
    const arm = () => {
      if (soundIsEnabled()) enableAmbientSound();
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
    window.addEventListener("pointerdown", arm);
    window.addEventListener("keydown", arm);

    // 3) Resume sound if tab regains visibility
    const vis = () => resumeAmbientIfNeeded();
    document.addEventListener("visibilitychange", vis);

    return () => {
      document.removeEventListener("visibilitychange", vis);
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      window.location.href = `${API_BASE}/ref/${encodeURIComponent(ref)}`;
    }
  }, []);

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <ErrorBoundary>
        <Router>
          {!effectsOff && <FXCanvas paused={false} />}
          <AmbientLayers />
          <div className="app-layout">
            <LeftNav />
            <main className="main-view">
              <Suspense fallback={<div className="section">🌊 Loading tides…</div>}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/quests" element={<Quests />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/referral" element={<Referral />} />
                  <Route path="/ref/:code" element={<RefRedirect />} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/token-sale" element={<TokenSale />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/isles" element={<Isles />} />

                  {/* 🔧 Connectivity check route */}
                  <Route path="/test-api" element={<TestAPI />} />

                  {/* Fallback 404 */}
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
