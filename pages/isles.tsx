import React from 'react';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeader from '@/components/ui/SectionHeader';
import IslesMapCanvas from '@/components/isles/IslesMapCanvas';
import GlassCard from '@/components/ui/GlassCard';

const isleData = [
  { name: 'Aureate Reef', locked: false },
  { name: 'Tidal Forge', locked: false },
  { name: 'Nebula Cove', locked: true },
  { name: 'Obsidian Vault', locked: true },
  { name: 'Sunken Archive', locked: false },
  { name: 'Starlit Grotto', locked: true },
  { name: 'Eclipse Key', locked: true },
];

export default function IslesPage() {
  return (
    <PageContainer>
      <div style={{ display: 'grid', gap: 20 }}>
        <SectionHeader title="Isles" subtitle="Floating orb-style islands" />
        <IslesMapCanvas isles={isleData} />
        <GlassCard padding="16px">
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ fontWeight: 700 }}>Island Lore</div>
            <p style={{ margin: 0, color: 'rgba(232,241,255,0.7)' }}>
              Unlock sealed isles to uncover lore fragments and neon gold rewards. Locked orbs shimmer with glass rings until your
              level rises.
            </p>
          </div>
        </GlassCard>
      </div>
    </PageContainer>
  );
}
