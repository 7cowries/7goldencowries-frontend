const THEME_KEY = "theme";
const ANIMATIONS_KEY = "animations";

export const THEMES = {
  yolo: "yolo",
  deep: "deep",
};

function applyTheme(theme) {
  const isYolo = (theme || THEMES.yolo) === THEMES.yolo;
  document.body.classList.toggle("theme-yolo-pop", isYolo);
}

function applyAnimations(enabled) {
  document.body.classList.toggle("animations-off", !enabled);
}

export function initTheme() {
  if (typeof document === "undefined") return;
  const savedTheme = localStorage.getItem(THEME_KEY) || THEMES.yolo;
  const animationsPref = localStorage.getItem(ANIMATIONS_KEY);

  applyTheme(savedTheme);
  applyAnimations(animationsPref !== "off");
}

export function setTheme(theme) {
  if (typeof document === "undefined") return;
  const next = theme === THEMES.deep ? THEMES.deep : THEMES.yolo;
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

export function currentTheme() {
  if (typeof document === "undefined") return THEMES.yolo;
  return document.body.classList.contains("theme-yolo-pop") ? THEMES.yolo : THEMES.deep;
}

export function toggleTheme() {
  const next = currentTheme() === THEMES.yolo ? THEMES.deep : THEMES.yolo;
  setTheme(next);
  return next;
}

export function animationsEnabled() {
  if (typeof document === "undefined") return true;
  return !document.body.classList.contains("animations-off");
}

export function setAnimationsEnabled(enabled) {
  if (typeof document === "undefined") return;
  localStorage.setItem(ANIMATIONS_KEY, enabled ? "on" : "off");
  applyAnimations(enabled);
}
