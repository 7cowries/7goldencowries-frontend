import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'ocean-theme-v14';

const defaultState = {
  particles: true,
  animations: true,
  mode: 'dark',
};

const ThemeContext = createContext({
  ...defaultState,
  setParticles: () => {},
  setAnimations: () => {},
  setMode: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [particles, setParticles] = useState(defaultState.particles);
  const [animations, setAnimations] = useState(defaultState.animations);
  const [mode, setMode] = useState(defaultState.mode);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setParticles(parsed.particles ?? defaultState.particles);
        setAnimations(parsed.animations ?? defaultState.animations);
        setMode(parsed.mode ?? defaultState.mode);
      }
    } catch (err) {
      console.warn('Theme restore skipped', err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ particles, animations, mode })
      );
    } catch (err) {
      console.warn('Theme persist skipped', err);
    }
  }, [particles, animations, mode]);

  useEffect(() => {
    document.body.dataset.mode = mode;
  }, [mode]);

  const value = useMemo(
    () => ({ particles, animations, mode, setParticles, setAnimations, setMode }),
    [particles, animations, mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
