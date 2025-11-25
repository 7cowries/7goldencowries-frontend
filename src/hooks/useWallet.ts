import { useWallet as useWalletFromContext } from "../context/WalletContext";

export function useWallet() {
  return useWalletFromContext();
}

// Legacy helpers kept for compatibility with existing imports
export const useTonWallet = () => useWalletFromContext()?.wallet || null;
export function useTonConnect() {
  const { wallet } = useWalletFromContext();
  return { wallet };
}

export default useWallet;
