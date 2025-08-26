// src/utils/sounds.js
// Centralized sound control with autoplay resilience + localStorage prefs.

const LS_KEY = "soundEnabled";
let ambient = null;
let enabled = localStorage.getItem(LS_KEY);
let isEnabled = enabled === null ? true : enabled === "true"; // default ON

function safePlay(audio) {
  if (!isEnabled) return;
  audio.play().catch(() => {});
}

export function enableAmbientSound() {
  if (ambient) return;
  ambient = new Audio("/audio/waves-harbor.wav");
  ambient.loop = true;
  ambient.volume = 0.25;
  safePlay(ambient);
}

export function resumeAmbientIfNeeded() {
  if (!ambient) return;
  if (isEnabled && ambient.paused) safePlay(ambient);
}

export function toggleMute() {
  isEnabled = !isEnabled;
  localStorage.setItem(LS_KEY, String(isEnabled));
  if (ambient) {
    ambient.muted = !isEnabled;
    if (isEnabled) resumeAmbientIfNeeded();
  }
  return !isEnabled; // returns "muted?" for convenience
}

export function getMuteState() {
  return !isEnabled; // muted?
}

export function soundIsEnabled() {
  return isEnabled;
}

/* ---------- Click / XP SFX ---------- */
export function playClick() {
  if (!isEnabled) return;
  const a = new Audio("/audio/click.wav");
  a.volume = 0.45;
  safePlay(a);
}

export function playXP() {
  if (!isEnabled) return;
  const a = new Audio("/audio/xp-chime.wav");
  a.volume = 0.65;
  safePlay(a);
}

/* ---------- Global click SFX delegate ---------- */
/**
 * Attach once; plays click SFX for common interactive elements:
 * - <button>, [role="button"], .btn, .tab, .nav-item
 * - <a href="..."> links (left click only)
 * Add data-no-sfx to any element to opt out.
 */
export function attachGlobalClickSFX() {
  if (window.__sfxGlobalAttached) return;

  const isElemClickable = (el) => {
    if (!el || el.nodeType !== 1) return false;
    if (el.hasAttribute("data-no-sfx")) return false;

    const tag = el.tagName;
    if (tag === "BUTTON") return true;
    if (tag === "A" && el.getAttribute("href")) return true;

    const role = el.getAttribute("role");
    if (role === "button" || role === "link") return true;

    const cls = el.classList;
    if (!cls) return false;
    return (
      cls.contains("btn") ||
      cls.contains("tab") ||
      cls.contains("nav-item") ||
      cls.contains("nav-link") ||
      cls.contains("cta") ||
      cls.contains("chip")
    );
  };

  const findClickable = (start) => {
    let el = start;
    for (let i = 0; i < 6 && el; i++) { // walk up a few levels
      if (isElemClickable(el)) return el;
      el = el.parentElement;
    }
    return null;
  };

  const clickHandler = (e) => {
    if (!isEnabled) return;
    if (e.button !== 0) return; // left click only
    const target = findClickable(e.target);
    if (!target) return;
    playClick();
  };

  const keyHandler = (e) => {
    if (!isEnabled) return;
    if (e.key !== "Enter" && e.key !== " ") return;
    const el = document.activeElement;
    if (findClickable(el)) playClick();
  };

  document.addEventListener("click", clickHandler, true);
  document.addEventListener("keydown", keyHandler, true);

  window.__sfxGlobalAttached = true;
}
