import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEYS = {
  theme: "ui:theme",
  animations: "ui:animations",
  ambient: "ui:ambient",
};

const DEFAULT_THEME = "yolo"; // matches existing theme-yolo-pop styles
const DEFAULT_ANIMATIONS = true;
const DEFAULT_AMBIENT = false; // hide decorative overlays by default

function readString(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value || fallback;
  } catch {
    return fallback;
  }
}

function readBool(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return fallback;
    return value === "true";
  } catch {
    return fallback;
  }
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => readString(STORAGE_KEYS.theme, DEFAULT_THEME));
  const [animationsEnabled, setAnimationsEnabled] = useState(() =>
    readBool(STORAGE_KEYS.animations, DEFAULT_ANIMATIONS)
  );
  const [ambientEnabled, setAmbientEnabled] = useState(() =>
    readBool(STORAGE_KEYS.ambient, DEFAULT_AMBIENT)
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.theme, theme);
    } catch {
      // ignore storage errors
    }
    const body = typeof document !== "undefined" ? document.body : null;
    if (!body) return;

    body.dataset.theme = theme;
    body.classList.toggle("theme-yolo-pop", theme === "yolo");
    body.classList.toggle("theme-ocean-light", theme === "ocean");
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.animations, String(animationsEnabled));
    } catch {
      // ignore storage errors
    }
    const body = typeof document !== "undefined" ? document.body : null;
    if (!body) return;
    body.classList.toggle("no-animations", !animationsEnabled);
  }, [animationsEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ambient, String(ambientEnabled));
    } catch {
      // ignore storage errors
    }
    const body = typeof document !== "undefined" ? document.body : null;
    if (!body) return;
    body.classList.toggle("no-ambient", !ambientEnabled);
  }, [ambientEnabled]);

  const cycleTheme = useCallback(() => {
    setTheme((current) => (current === "yolo" ? "ocean" : "yolo"));
  }, []);

  const toggleAnimations = useCallback(() => {
    setAnimationsEnabled((prev) => !prev);
  }, []);

  const toggleAmbient = useCallback(() => {
    setAmbientEnabled((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      cycleTheme,
      animationsEnabled,
      setAnimationsEnabled,
      toggleAnimations,
      ambientEnabled,
      setAmbientEnabled,
      toggleAmbient,
    }),
    [
      theme,
      animationsEnabled,
      ambientEnabled,
      cycleTheme,
      toggleAnimations,
      toggleAmbient,
    ]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
