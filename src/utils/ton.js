export function ensureTonUI() {
  if (typeof window === 'undefined') return null;
  try {
    if (window.tonConnectUI) return window.tonConnectUI;
    // require here so SSR never touches the package
    const { TonConnectUI } = require('@tonconnect/ui');
    const tc = new TonConnectUI({
      manifestUrl: 'https://7goldencowries.com/tonconnect-manifest.json',
    });
    window.tonConnectUI = tc;
    return tc;
  } catch (_) {
    return null;
  }
}
