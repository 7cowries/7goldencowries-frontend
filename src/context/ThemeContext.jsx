import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "theme-preferences";

const defaultPrefs = {
  theme: "dark",
  overlays: false,
  particles: false,
  animations: true,
};

const ThemeContext = createContext({
  ...defaultPrefs,
  setTheme: () => {},
  toggleOverlays: () => {},
  toggleParticles: () => {},
  toggleAnimations: () => {},
});

export function ThemeProvider({ children }) {
  const [prefs, setPrefs] = useState(defaultPrefs);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPrefs({ ...defaultPrefs, ...parsed });
      }
    } catch (err) {
      console.warn("Unable to read theme preferences", err);
    }
  }, []);

  useEffect(() => {
    const nextPrefs = { ...prefs };
    document.body.dataset.theme = nextPrefs.theme;
    document.body.classList.toggle("motion-safe", Boolean(nextPrefs.animations));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPrefs));
  }, [prefs]);

  const value = useMemo(
    () => ({
      ...prefs,
      setTheme: (theme) => setPrefs((prev) => ({ ...prev, theme })),
      toggleOverlays: () => setPrefs((prev) => ({ ...prev, overlays: !prev.overlays })),
      toggleParticles: () => setPrefs((prev) => ({ ...prev, particles: !prev.particles })),
      toggleAnimations: () => setPrefs((prev) => ({ ...prev, animations: !prev.animations })),
    }),
    [prefs]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
