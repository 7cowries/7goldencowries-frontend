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
function createAudio(src, volume) {
  if (typeof Audio === "undefined") return null;
  try {
    const a = new Audio(src);
    a.volume = volume;
    a.addEventListener("error", (e) => {
      console.warn(`Failed to load audio: ${src}`, e);
    });
    // Preload immediately
    a.load();
    return a;
  } catch (err) {
    console.warn(`Audio init failed: ${src}`, err);
    return null;
  }
}

const clickAudio = createAudio("/audio/click.wav", 0.45);
const xpAudio = createAudio("/audio/xp-chime.wav", 0.65);

export function playClick() {
  if (!isEnabled || !clickAudio) return;
  clickAudio.currentTime = 0;
  safePlay(clickAudio);
}

export function playXP() {
  if (!isEnabled || !xpAudio) return;
  xpAudio.currentTime = 0;
  safePlay(xpAudio);
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
