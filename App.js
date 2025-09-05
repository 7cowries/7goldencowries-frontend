import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { TonConnectButton, TonConnectUIProvider } from '@tonconnect/ui-react';
import WalletInput from './components/WalletInput';
import Quests from './pages/Quests';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import Referral from './pages/Referral';
import Leaderboard from './pages/Leaderboard';
import Isles from './pages/Isles';
import './App.css';

const manifestUrl = 'https://7goldencowries.github.io/tonconnect-manifest.json';

function App() {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <Router>
        <div className="app-container">
          <header className="app-header">
            <div className="logo">🐚 7GoldenCowries</div>
            <nav className="nav-links">
              <Link to="/quests">📜Quests</Link>
              <Link to="/leaderboard">📊Leaderboard</Link>
              <Link to="/referral">💎Referral</Link>
              <Link to="/subscription">🪙Subscription</Link>
              <Link to="/profile">👤Profile</Link>
              <Link to="/isles">🌊Isles</Link>
            </nav>
            <TonConnectButton className="ton-connect" />
            <WalletInput />
          </header>

          <Routes>
            <Route path="/quests" element={<Quests />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/isles" element={<Isles />} />
            <Route path="*" element={<Quests />} />
          </Routes>
        </div>
      </Router>
    </TonConnectUIProvider>
  );
}

export default App;
