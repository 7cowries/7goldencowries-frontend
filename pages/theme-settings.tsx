import React from 'react';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeader from '@/components/ui/SectionHeader';
import GlassCard from '@/components/ui/GlassCard';
import { useThemeContext } from '@/theme/ThemeContext';

export default function ThemeSettingsPage() {
  const { mode, particles, animations, setMode, toggleParticles, toggleAnimations, design } = useThemeContext();
  return (
    <PageContainer>
      <div style={{ display: 'grid', gap: 20 }}>
        <SectionHeader title="Theme Settings" subtitle="Toggle particles, animations, and mode" />
        <GlassCard padding="16px" glow>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>Mode</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setMode('dark')}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: design.borders.glass,
                    background: mode === 'dark' ? 'rgba(255,239,159,0.18)' : 'rgba(255,255,255,0.05)',
                    color: design.colors.neutrals.base,
                  }}
                >
                  Dark
                </button>
                <button
                  onClick={() => setMode('light')}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: design.borders.glass,
                    background: mode === 'light' ? 'rgba(255,239,159,0.18)' : 'rgba(255,255,255,0.05)',
                    color: design.colors.neutrals.base,
                  }}
                >
                  Light
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>Particles</div>
              <button onClick={toggleParticles} style={{ padding: '10px 14px', borderRadius: 10, border: design.borders.glass }}>
                {particles ? 'Disable' : 'Enable'}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>Animations</div>
              <button
                onClick={toggleAnimations}
                style={{ padding: '10px 14px', borderRadius: 10, border: design.borders.glass }}
              >
                {animations ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </PageContainer>
  );
}
