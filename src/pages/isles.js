import React, { useMemo, useState } from 'react';
import PageContainer from '../components/ui/PageContainer';
import GlassCard from '../components/ui/GlassCard';
import IslesMapCanvas from '../components/isles/IslesMapCanvas';

const baseIsles = [
  'Aurea',
  'Mariana',
  'Solstice',
  'Tidal Crown',
  'Nebula Reef',
  'Crypt Tide',
  'Eclipse Gate',
];

const IslesPage = () => {
  const [active, setActive] = useState(null);
  const isles = useMemo(
    () => baseIsles.map((name, idx) => ({ name, locked: idx > 3 })),
    []
  );

  return (
    <PageContainer>
      <GlassCard title="Isles" subtitle="Floating orb-style islands with lore">
        <IslesMapCanvas isles={isles} onSelect={setActive} />
        {active && (
          <GlassCard title={active.name} subtitle={active.locked ? 'Locked with gold ring' : 'Ready to sail'}>
            <p style={{ color: '#cfe6ff' }}>
              {active.name} isle awaits with lore and rewards. Unlock quests and staking boosts hidden in its depths.
            </p>
          </GlassCard>
        )}
      </GlassCard>
    </PageContainer>
  );
};

export default IslesPage;
