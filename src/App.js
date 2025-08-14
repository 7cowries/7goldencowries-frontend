import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import Quests from "./pages/Quests";
import Leaderboard from "./pages/Leaderboard";
import Referral from "./pages/Referral";
import Isles from "./pages/Isles";
import TokenSale from "./pages/TokenSale";

import LeftNav from "./components/LeftNav";
import "./App.css";

const App = () => {
  return (
    <TonConnectUIProvider manifestUrl="https://7cowries.github.io/7goldencowries-connect/tonconnect-manifest.json">
      <Router>
        <div className="app-layout">
          <LeftNav />
          <main className="main-view">
            <Routes>
              <Route path="/" element={<Quests />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/quests" element={<Quests />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/referral" element={<Referral />} />
              <Route path="/isles" element={<Isles />} />
              <Route path="/token-sale" element={<TokenSale />} />
            </Routes>
          </main>
        </div>
      </Router>
    </TonConnectUIProvider>
  );
};

export default App;
