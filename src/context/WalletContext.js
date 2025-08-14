import { createContext, useContext, useEffect, useMemo, useState } from "react";

const WalletContext = createContext({ wallet: null, setWallet: () => {} });
export const useWallet = () => useContext(WalletContext);

export default function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(() => localStorage.getItem("walletAddress") || null);

  // keep localStorage in sync
  useEffect(() => {
    if (wallet) localStorage.setItem("walletAddress", wallet);
  }, [wallet]);

  // also read any TON address that other code may have saved
  const value = useMemo(() => ({ wallet, setWallet }), [wallet]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
