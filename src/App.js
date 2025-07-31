import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { FaRegCompass, FaUserCircle, FaGem, FaCrown, FaChartBar, FaMap } from "react-icons/fa";

import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import Quests from "./pages/Quests";
import Leaderboard from "./pages/Leaderboard";
import Referral from "./pages/Referral";
import Isles from "./pages/Isles";

import "./App.css"; // 📦 include custom theme styles

const App = () => {
  return (
    <TonConnectUIProvider manifestUrl="https://7cowries.github.io/7goldencowries-connect/tonconnect-manifest.json">
      <Router>
        <div className="app-container">
          <header className="app-header">
            <h1 className="app-title">🐚 7GoldenCowries</h1>
            <nav className="nav-menu">
              <NavItem to="/quests" icon={<FaRegCompass />} label="Quests" />
              <NavItem to="/leaderboard" icon={<FaChartBar />} label="Leaderboard" />
              <NavItem to="/referral" icon={<FaGem />} label="Referral" />
              <NavItem to="/subscription" icon={<FaCrown />} label="Subscription" />
              <NavItem to="/profile" icon={<FaUserCircle />} label="Profile" />
              <NavItem to="/isles" icon={<FaMap />} label="Isles" />
            </nav>
          </header>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Profile />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/quests" element={<Quests />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/referral" element={<Referral />} />
              <Route path="/isles" element={<Isles />} />
            </Routes>
          </main>
        </div>
      </Router>
    </TonConnectUIProvider>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `nav-item ${isActive ? "active" : ""}`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default App;
