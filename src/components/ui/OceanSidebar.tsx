import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useThemeContext } from '@/theme/ThemeContext';

const links = [
  { href: '/', label: 'Home' },
  { href: '/quests', label: 'Quests' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/referral', label: 'Referral' },
  { href: '/subscription', label: 'Subscription' },
  { href: '/token-sale', label: 'Token Sale' },
  { href: '/isles', label: 'Isles' },
  { href: '/profile', label: 'Profile' },
  { href: '/staking', label: 'Staking' },
  { href: '/theme-settings', label: 'Theme Settings' },
];

const OceanSidebar: React.FC = () => {
  const router = useRouter();
  const { design } = useThemeContext();
  return (
    <aside
      style={{
        width: 260,
        padding: '24px 18px',
        background: 'rgba(4, 18, 38, 0.55)',
        borderRight: design.borders.glass,
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: design.gradients.gold, boxShadow: design.effects.shadows.glow }} />
        <div>
          <div style={{ fontWeight: 700, letterSpacing: '0.08em' }}>Hybrid Ocean</div>
          <div style={{ fontSize: 12, color: design.colors.neutrals.muted }}>v1.4</div>
        </div>
      </div>
      <nav style={{ display: 'grid', gap: 8 }}>
        {links.map((link) => {
          const active = router.pathname === link.href;
          return (
            <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: active ? 'rgba(255, 216, 107, 0.12)' : 'transparent',
                  border: active ? design.borders.glass : '1px solid rgba(255,255,255,0.05)',
                  color: active ? design.colors.gold.neon : design.colors.neutrals.base,
                  boxShadow: active ? design.effects.shadows.glow : undefined,
                  transition: design.effects.transitions.soft,
                }}
              >
                {link.label}
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default OceanSidebar;
