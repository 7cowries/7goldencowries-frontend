import React from 'react';
import PageContainer from '../components/ui/PageContainer';
import GlassCard from '../components/ui/GlassCard';
import { useTheme } from '../theme/ThemeContext';

const ThemeSettings = () => {
  const { particles, animations, mode, setParticles, setAnimations, setMode } = useTheme();

  return (
    <PageContainer>
      <GlassCard title="Theme Settings" subtitle="Toggle particles, animations, light/dark">
        <div className="grid-responsive">
          <div className="glass-panel">
            <div className="glass-inner">
              <label className="flex-between">
                <span>Particles</span>
                <input type="checkbox" checked={particles} onChange={(e) => setParticles(e.target.checked)} />
              </label>
              <label className="flex-between">
                <span>Animations</span>
                <input type="checkbox" checked={animations} onChange={(e) => setAnimations(e.target.checked)} />
              </label>
              <label className="flex-between">
                <span>Mode</span>
                <select className="input-glass" value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </GlassCard>
    </PageContainer>
  );
};

export default ThemeSettings;
