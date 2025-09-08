const KEY = 'effects_off';

export const getEffectsOff = () => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

export const setEffectsOff = (off) => {
  try {
    if (off) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event('effects:toggled'));
};
