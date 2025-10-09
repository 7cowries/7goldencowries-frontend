import { Link, NavLink } from "react-router-dom";

export default function Sidebar({ open, onClose }) {
  const items = [
    { to: '/',           label: '7GoldenCowries', icon: '📍', exact: true },
    { to: '/quests',     label: 'Quests',         icon: '⚡' },
    { to: '/leaderboard',label: 'Leaderboard',    icon: '📊' },
    { to: '/referral',   label: 'Referral',       icon: '👑' },
    { to: '/subscription',label:'Subscription',   icon: '💎' },
    { to: '/token-sale', label: 'Token Sale',     icon: '🪙' },
    { to: '/profile',    label: 'Profile',        icon: '🔗' },
    { to: '/isles',      label: 'Isles',          icon: '🌿' },
  ];

  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="nav-header">
          <div className="nav-logo">7GoldenCowries</div>
          <button className="menu-btn" onClick={onClose} aria-label="Close menu">✕</button>
        </div>
        <nav className="nav-list">
          {items.map(({to,label,icon,exact}) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span style={{fontSize:18}}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      {/* Mobile scrim */}
      <div className={`nav-scrim ${open ? 'show' : ''}`} onClick={onClose} />
    </>
  );
}
