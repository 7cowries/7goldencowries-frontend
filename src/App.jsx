import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
// import your pages:
import Home from './pages/Home';
import Quests from './pages/Quests';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Isles from './pages/Isles';
import Referral from './pages/Referral';
import Subscription from './pages/Subscription';
import TokenSale from './pages/TokenSale';

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/token-sale" element={<TokenSale />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/isles" element={<Isles />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
