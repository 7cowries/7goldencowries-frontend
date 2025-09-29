import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WalletAndUserProvider } from './hooks/useWallet'; // Import our new Provider

// Import Layout and Pages
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Quests from './pages/Quests';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import TokenSale from './pages/TokenSale';
import Referral from './pages/Referral';
import RefRedirect from './pages/RefRedirect';
import NotFound from './pages/NotFound';

// Import Styles
import './App.css';
import './styles/theme.css';
import './styles/enchanted.css';

function App() {
  return (
    <WalletAndUserProvider> {/* Wrap the entire app */}
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="quests" element={<Quests />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="token-sale" element={<TokenSale />} />
            <Route path="referral" element={<Referral />} />
          </Route>
          <Route path="/ref/:refCode" element={<RefRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </WalletAndUserProvider>
  );
}

export default App;
