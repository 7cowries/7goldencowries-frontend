export async function ensureTonUI() {
  if (typeof window === 'undefined') return null;
  if (window.tonConnectUI) return window.tonConnectUI;
  const { TonConnectUI } = await import('@tonconnect/ui');
  const ui = new TonConnectUI({
    manifestUrl: '/tonconnect-manifest.json',
    walletsListSource: 'https://config.ton.org/wallets-v2.json'
  });
  window.tonConnectUI = ui;
  return ui;
}

export function findTonAddress() {
  if (typeof window === 'undefined') return null;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      const v = localStorage.getItem(k);
      try {
        const j = JSON.parse(v || '{}');
        const a =
          j?.account?.address ||
          j?.address ||
          j?.wallet?.account?.address ||
          j?.state?.account?.address;
        if (a) return a;
      } catch {}
    }
  } catch {}
  return null;
}
