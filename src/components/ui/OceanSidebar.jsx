import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const links = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/quests', label: 'Quests', icon: '🧭' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { href: '/referral', label: 'Referral', icon: '🪙' },
  { href: '/subscription', label: 'Subscription', icon: '💎' },
  { href: '/token-sale', label: 'Token Sale', icon: '💧' },
  { href: '/isles', label: 'Isles', icon: '🌌' },
  { href: '/profile', label: 'Profile', icon: '🧜' },
  { href: '/staking', label: 'Staking', icon: '📈' },
  { href: '/theme-settings', label: 'Theme Settings', icon: '⚙️' },
];

const OceanSidebar = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const active = useMemo(() => router.pathname, [router.pathname]);

  return (
    <>
      <button
        className="btn-primary"
        style={{ position: 'fixed', top: 14, left: 14, zIndex: 20, display: 'none' }}
        onClick={() => setOpen((v) => !v)}
      >
        ☰
      </button>
      <aside
        className="glass-panel"
        style={{
          width: 280,
          height: '100vh',
          position: 'sticky',
          top: 0,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          zIndex: 10,
          backdropFilter: 'blur(18px)',
        }}
      >
        <div className="glass-inner" style={{ gap: 10 }}>
          <div className="section-header">
            <div>
              <h3>Hybrid Ocean</h3>
              <p className="small-label">v1.4 Web3 Isles</p>
            </div>
          </div>
          <nav style={{ display: 'grid', gap: 10 }}>
            {links.map((link) => (
              <Link key={link.href} href={link.href} legacyBehavior>
                <a
                  className="pill"
                  style={{
                    padding: '12px 14px',
                    background: active === link.href ? 'rgba(255,216,107,0.22)' : 'rgba(255,255,255,0.05)',
                    color: active === link.href ? '#0d1827' : undefined,
                    borderColor: active === link.href ? 'rgba(255,216,107,0.5)' : undefined,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                  }}
                  onClick={() => setOpen(false)}
                >
                  <span style={{ width: 24, display: 'inline-block' }}>{link.icon}</span>
                  {link.label}
                </a>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default OceanSidebar;
