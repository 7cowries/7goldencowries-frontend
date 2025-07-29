import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Quests' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/referral', label: 'Referral' },
    { path: '/subscription', label: 'Subscription' },
    { path: '/profile', label: 'Profile' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#001f3f', color: '#fff', fontFamily: 'Poppins, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: '#001a33', padding: 20 }}>
        <h2 style={{ color: '#FFDC00' }}>⚱️ Cowries</h2>
        <nav style={{ marginTop: 20 }}>
          {navItems.map((item) => (
            <div key={item.path} style={{ marginBottom: 12 }}>
              <Link
                to={item.path}
                style={{
                  color: location.pathname === item.path ? '#FFDC00' : '#ccc',
                  textDecoration: 'none',
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                }}
              >
                {item.label}
              </Link>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 32, background: 'linear-gradient(to bottom, #001f3f, #002b60)' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
