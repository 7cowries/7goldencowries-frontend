// src/hooks/useWalletSession.js
import { useEffect, useState, useCallback } from "react";
import { bindWallet, getMe, getSubscriptionStatus, clearUserCache } from "@/utils/api";

export default function useWalletSession() {
  const [me, setMe] = useState(null);
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setMe(await getMe({ force: true })); } catch { setMe(null); }
    try { setSub(await getSubscriptionStatus()); } catch { setSub(null); }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const connectWallet = useCallback(async (address) => { await bindWallet(address); await refresh(); }, [refresh]);
  const disconnect = useCallback(() => { clearUserCache(); setMe(null); setSub(null); }, []);

  return { me, sub, loading, connectWallet, refresh, disconnect };
}
