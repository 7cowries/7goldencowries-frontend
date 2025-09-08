export function getEffectsOff() {
  try {
    return localStorage.getItem('effects:off') === '1';
  } catch {
    return false;
  }
}
export function setEffectsOff(off) {
  try {
    if (off) localStorage.setItem('effects:off','1');
    else localStorage.removeItem('effects:off');
  } catch {}
  window.dispatchEvent(new Event('effects:toggled'));
}
