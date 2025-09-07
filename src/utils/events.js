export function emitWalletChanged(wallet) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('wallet:changed', { detail: { wallet } })
    );
  }
}
