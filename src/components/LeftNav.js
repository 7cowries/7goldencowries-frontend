import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './LeftNav.css';

const navItems = [
  { name: 'Quests', path: '/quests', icon: '⚡' },
  { name: 'Leaderboard', path: '/leaderboard', icon: '📊' },
  { name: 'Referral', path: '/referral', icon: '👑' },
  { name: 'Subscription', path: '/subscription', icon: '💎' },
  { name: 'Token Sale', path: '/token-sale', icon: '🪙' },
  { name: 'Profile', path: '/profile', icon: '🧬' },
  { name: 'Isles', path: '/isles', icon: '🏝️' }
];

const LeftNav = () => {
  const location = useLocation();

  return (
    <nav className="sidebar">
      <div className="sidebar-title">
        <img src="/logo192.png" alt="logo" style={{ width: 28, marginRight: 8 }} />
        <span>7GoldenCowries</span>
      </div>

      <ul className="sidebar-links">
        {navItems.map((item) => (
          <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
            <Link to={item.path}>
              <span className="icon">{item.icon}</span>
              <span className="label">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default LeftNav;
