import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useTonAddress } from "@tonconnect/ui-react";
import { ensureWalletBound } from "../utils/walletBind";

const WalletContext = createContext({ wallet: null, setWallet: () => {} });
export const useWallet = () => useContext(WalletContext);

export default function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(() => localStorage.getItem("walletAddress") || null);
  const tonWallet = useTonAddress();

  // keep localStorage in sync
  useEffect(() => {
    if (wallet) {
      localStorage.setItem("walletAddress", wallet);
      localStorage.setItem("wallet", wallet);
      window.dispatchEvent(new CustomEvent('wallet:changed', { detail: { wallet } }));
    }
  }, [wallet]);

  // update wallet when TonConnect provides one
  useEffect(() => {
    if (tonWallet) setWallet(tonWallet);
  }, [tonWallet]);

  // bind wallet to backend session
  useEffect(() => {
    ensureWalletBound(wallet);
  }, [wallet]);

  // also read any TON address that other code may have saved
  const value = useMemo(() => ({ wallet, setWallet }), [wallet]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
