// src/components/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const links = [
    { to: '/quests',      label: 'Quests'      },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/referral',    label: 'Referral'    },
    { to: '/subscription',label: 'Subscription'},
    { to: '/profile',     label: 'Profile'     },
  ];

  return (
    <nav className="bg-blue-800 text-white w-48 flex-shrink-0">
      <div className="p-6 text-2xl font-bold">🐚 Cowries</div>
      <ul>
        {links.map(link => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `block px-6 py-3 hover:bg-blue-700 ${
                  isActive ? 'bg-blue-700 font-semibold' : ''
                }`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
