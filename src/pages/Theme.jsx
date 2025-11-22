import React, { useEffect, useState } from "react";
import Page from "../components/Page";
import {
  THEMES,
  currentTheme,
  setTheme,
  animationsEnabled,
  setAnimationsEnabled,
} from "../utils/theme";

export default function Theme() {
  const [theme, setThemeState] = useState(THEMES.yolo);
  const [animOn, setAnimOn] = useState(true);

  useEffect(() => {
    setThemeState(currentTheme());
    setAnimOn(animationsEnabled());
  }, []);

  const handleThemeChange = (next) => {
    setTheme(next);
    setThemeState(next);
  };

  const toggleAnimations = () => {
    const next = !animOn;
    setAnimationsEnabled(next);
    setAnimOn(next);
  };

  return (
    <Page>
      <section className="section glass">
        <h1 className="section-title">🎨 Theme & Comfort</h1>
        <p className="muted" style={{ marginBottom: 20 }}>
          Pick the visual style that feels best and control motion effects. Your choices are
          saved locally and applied across the app.
        </p>

        <div className="card glass" style={{ marginBottom: 16 }}>
          <h3>Color theme</h3>
          <div className="theme-options">
            <label className={`pill-option ${theme === THEMES.yolo ? "active" : ""}`}>
              <input
                type="radio"
                name="theme"
                value="yolo"
                checked={theme === THEMES.yolo}
                onChange={() => handleThemeChange(THEMES.yolo)}
              />
              <span>Yolo Pop (bright)</span>
            </label>
            <label className={`pill-option ${theme === THEMES.deep ? "active" : ""}`}>
              <input
                type="radio"
                name="theme"
                value="deep"
                checked={theme === THEMES.deep}
                onChange={() => handleThemeChange(THEMES.deep)}
              />
              <span>Deep Sea (muted)</span>
            </label>
          </div>
        </div>

        <div className="card glass">
          <h3>Motion</h3>
          <p className="muted" style={{ marginBottom: 10 }}>
            Disable particles, pulses, and animations if you prefer a calmer reading experience.
          </p>
          <label className={`toggle ${!animOn ? "off" : ""}`}>
            <input type="checkbox" checked={animOn} onChange={toggleAnimations} />
            <span className="slider" />
            <span className="toggle-label">
              {animOn ? "Animations enabled" : "Animations disabled"}
            </span>
          </label>
        </div>
      </section>
    </Page>
  );
}
