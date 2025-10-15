import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const items = [
  { href: '/', label: 'Quests', icon: '⚡' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '📊' },
  { href: '/referral', label: 'Referral', icon: '👑' },
  { href: '/subscription', label: 'Subscription', icon: '💎' },
  { href: '/token-sale', label: 'Token Sale', icon: '🪙' },
  { href: '/profile', label: 'Profile', icon: '🔗' },
  { href: '/isles', label: 'Isles', icon: '🪴' }
];

export default function LeftNav() {
  const router = useRouter();
  return (
    <nav style={{width:280, padding:16}}>
      <div style={{marginBottom:12, fontWeight:700}}>7GoldenCowries</div>
      {items.map(it => {
        const active = router.pathname === it.href;
        return (
          <Link key={it.href} href={it.href} legacyBehavior>
            <a style={{
              display:'flex', alignItems:'center', gap:12,
              padding:'12px 16px', margin:'8px 0',
              borderRadius:14,
              background: active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
              border: active ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.12)'
            }}>
              <span style={{fontSize:18}}>{it.icon}</span>
              <span>{it.label}</span>
            </a>
          </Link>
        );
      })}
    </nav>
  );
}
