import React from "react";
import PageContainer from "../components/ui/PageContainer";
import SectionHeader from "../components/ui/SectionHeader";
import { useTheme } from "../context/ThemeContext";

export default function ThemeSettings() {
  const {
    theme,
    overlays,
    particles,
    animations,
    setTheme,
    toggleOverlays,
    toggleParticles,
    toggleAnimations,
  } = useTheme();

  return (
    <PageContainer>
      <SectionHeader
        title="Theme Settings"
        subtitle="Control light/dark mode, overlays, particle haze, and motion preferences."
      />
      <div className="card glass">
        <div className="toggle-row">
          <div>
            <p className="eyebrow">Appearance</p>
            <p className="muted">Switch between light and dark palettes.</p>
          </div>
          <div className="chip-group">
            <button
              className={`chip ${theme === "light" ? "active" : ""}`}
              onClick={() => setTheme("light")}
            >
              Light
            </button>
            <button
              className={`chip ${theme === "dark" ? "active" : ""}`}
              onClick={() => setTheme("dark")}
            >
              Dark
            </button>
          </div>
        </div>

        <div className="toggle-row">
          <div>
            <p className="eyebrow">Glass overlays</p>
            <p className="muted">Enable the optional glassmorphism overlays from the PRD ocean theme.</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={overlays} onChange={toggleOverlays} />
            <span className="slider" />
          </label>
        </div>

        <div className="toggle-row">
          <div>
            <p className="eyebrow">Particles</p>
            <p className="muted">Toggle ambient particle haze for the hero backgrounds.</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={particles} onChange={toggleParticles} />
            <span className="slider" />
          </label>
        </div>

        <div className="toggle-row">
          <div>
            <p className="eyebrow">Animations</p>
            <p className="muted">Disable motion for accessibility or low-power scenarios.</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={animations} onChange={toggleAnimations} />
            <span className="slider" />
          </label>
        </div>
      </div>
    </PageContainer>
  );
}
