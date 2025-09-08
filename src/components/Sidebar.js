import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const links = [
    { to: '/quests', label: 'Quests' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/referral', label: 'Referral' },
    { to: '/subscription', label: 'Subscription' },
    { to: '/profile', label: 'Profile' }
  ];

  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setOpen(true)}>☰</button>
      <nav className={`sidebar glass ${open ? 'open' : ''}`}>
        <div className="p-6 text-2xl font-bold">🐚 Cowries</div>
        <ul>
          {links.map(link => (
            <li key={link.to}>
              <NavLink to={link.to} className={({ isActive }) => isActive ? 'active' : ''} onClick={close}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <button className="sidebar-close" onClick={close}>×</button>
      </nav>
      {open && <div className="sidebar-scrim" onClick={close} />}
    </>
  );
}
