import React from "react";
import Page from "../components/Page";
import { useTheme } from "../context/ThemeContext";

const colorSchemes = [
  {
    id: "yolo",
    title: "Yolo Pop",
    description: "Bright pastel glass with neon gradients.",
    badge: "🌈",
  },
  {
    id: "ocean",
    title: "Ocean Light",
    description: "Calm oceanic palette with softer overlays.",
    badge: "🌊",
  },
];

export default function ThemePage() {
  const {
    theme,
    setTheme,
    cycleTheme,
    animationsEnabled,
    toggleAnimations,
    ambientEnabled,
    toggleAmbient,
  } = useTheme();

  return (
    <Page>
      <div className="section theme-page glass">
        <header className="theme-header">
          <div>
            <p className="eyebrow">Appearance & accessibility</p>
            <h1>Theme controls</h1>
            <p className="muted">
              Pick your colour scheme, disable heavy animations, and choose whether the decorative
              ambient layers are shown. Changes are saved automatically.
            </p>
          </div>
          <button type="button" className="btn primary" onClick={cycleTheme}>
            Quick toggle
          </button>
        </header>

        <div className="theme-grid">
          {colorSchemes.map((option) => (
            <label
              key={option.id}
              className={`theme-card ${theme === option.id ? "active" : ""}`}
            >
              <div className="theme-card-top">
                <span className="theme-badge" aria-hidden>
                  {option.badge}
                </span>
                <div>
                  <p className="theme-title">{option.title}</p>
                  <p className="muted small">{option.description}</p>
                </div>
              </div>
              <input
                type="radio"
                name="color-scheme"
                value={option.id}
                checked={theme === option.id}
                onChange={() => setTheme(option.id)}
              />
            </label>
          ))}
        </div>

        <div className="theme-toggles">
          <div className="toggle-row">
            <div>
              <p className="theme-title">Animations</p>
              <p className="muted small">
                Disable looping drifts, glows, and transforms for a calmer experience.
              </p>
            </div>
            <button type="button" className="btn ghost" onClick={toggleAnimations}>
              {animationsEnabled ? "Animations on" : "Animations off"}
            </button>
          </div>

          <div className="toggle-row">
            <div>
              <p className="theme-title">Ambient overlays</p>
              <p className="muted small">
                Hide or show the decorative veil and orbs layered behind each page.
              </p>
            </div>
            <button type="button" className="btn ghost" onClick={toggleAmbient}>
              {ambientEnabled ? "Overlays visible" : "Overlays hidden"}
            </button>
          </div>
        </div>
      </div>
    </Page>
  );
}
