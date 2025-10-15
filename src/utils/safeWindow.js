export function safeWindow() {
  try {
    if (typeof window !== 'undefined') {
      if (window.ethereum) Object.freeze(window.ethereum);
      if (window.solana) Object.freeze(window.solana);
      if (window.phantom) Object.freeze(window.phantom);
    }
  } catch (_) {}
}
