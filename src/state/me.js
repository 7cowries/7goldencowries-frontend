import { createContext, useContext, useEffect, useCallback, useState } from "react";
import { getMe } from "../utils/api";

const MeContext = createContext({ me: null, refresh: async () => {} });

export function MeProvider({ children }) {
  const [me, setMe] = useState(null);

  const normalizeMe = (raw) => {
    const p = raw?.profile ?? raw ?? {};
    const history = raw?.history ?? p.history ?? p.questHistory ?? [];
    const xp = Number(p.xp ?? 0);
    const nextXP = Math.max(0, Number(p.nextXP ?? 0));
    const levelName = p.levelName ?? p.level ?? "Shellborn";
    const levelProgress = Number(
      p.levelProgress ?? (nextXP > 0 ? xp / nextXP : 0)
    );
    return {
      wallet: p.wallet ?? null,
      xp,
      nextXP,
      levelName,
      levelProgress: Math.max(0, Math.min(1, levelProgress)),
      tier: p.tier ?? p.subscriptionTier ?? "Free",
      socials: {
        twitter: { connected: !!(p.socials?.twitter?.connected || p.twitterHandle), handle: p.socials?.twitter?.handle || p.twitterHandle || null },
        telegram:{ connected: !!(p.socials?.telegram?.connected|| p.telegramId), username:p.socials?.telegram?.username|| p.telegramId || null },
        discord: { connected: !!(p.socials?.discord?.connected || p.discordId), id: p.socials?.discord?.id || p.discordId || null },
      },
      referralCode: p.referral_code ?? p.referralCode ?? null,
      history
    };
  };

  const refresh = useCallback(async () => {
    const raw = await getMe({ force: true });
    setMe(normalizeMe(raw || {}));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return <MeContext.Provider value={{ me, refresh, setMe }}>{children}</MeContext.Provider>;
}

export const useMe = () => useContext(MeContext);
