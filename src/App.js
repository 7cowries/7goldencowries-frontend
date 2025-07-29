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

const App = () => {
  return (
    <TonConnectUIProvider manifestUrl="https://7cowries.github.io/7goldencowries-connect/tonconnect-manifest.json">
      <Router>
        <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 text-white font-sans">
          <header className="flex flex-col md:flex-row justify-between items-center p-4 border-b border-yellow-400">
            <h1 className="text-3xl font-bold text-yellow-300 mb-2 md:mb-0">🐚 7GoldenCowries</h1>
            <nav className="flex space-x-4">
              <NavItem to="/quests" icon={<FaRegCompass />} label="Quests" />
              <NavItem to="/leaderboard" icon={<FaChartBar />} label="Leaderboard" />
              <NavItem to="/referral" icon={<FaGem />} label="Referral" />
              <NavItem to="/subscription" icon={<FaCrown />} label="Subscription" />
              <NavItem to="/profile" icon={<FaUserCircle />} label="Profile" />
              <NavItem to="/isles" icon={<FaMap />} label="Isles" />
            </nav>
          </header>

          <main className="p-4">
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
      `flex items-center space-x-1 px-3 py-1 rounded-md hover:bg-blue-600 transition ${
        isActive ? "bg-yellow-400 text-blue-900 font-bold" : "text-white"
      }`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default App;
