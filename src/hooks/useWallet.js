export function useWallet() {
  const wallet = localStorage.getItem('wallet');
  return { wallet };
}
