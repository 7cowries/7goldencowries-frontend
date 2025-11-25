import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import theme, { ThemeConfig } from './index';

export type ThemePreferences = {
  mode: 'dark' | 'light';
  particles: boolean;
  animations: boolean;
};

export type ThemeContextValue = ThemePreferences & {
  setMode: (mode: 'dark' | 'light') => void;
  toggleParticles: () => void;
  toggleAnimations: () => void;
  design: ThemeConfig;
};

const defaultPrefs: ThemePreferences = {
  mode: 'dark',
  particles: true,
  animations: true,
};

const STORAGE_KEY = 'hybrid-ocean-preferences';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<ThemePreferences>(defaultPrefs);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ThemePreferences;
        setPrefs({ ...defaultPrefs, ...parsed });
      } catch (err) {
        console.warn('Failed to parse theme preferences', err);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      document.documentElement.setAttribute('data-mode', prefs.mode);
    }
  }, [prefs]);

  const value = useMemo<ThemeContextValue>(() => ({
    ...prefs,
    design: theme,
    setMode: (mode) => setPrefs((prev) => ({ ...prev, mode })),
    toggleParticles: () => setPrefs((prev) => ({ ...prev, particles: !prev.particles })),
    toggleAnimations: () => setPrefs((prev) => ({ ...prev, animations: !prev.animations })),
  }), [prefs]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider');
  return ctx;
};

export default ThemeContext;
