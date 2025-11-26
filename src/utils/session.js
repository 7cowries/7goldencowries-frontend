import { API_URLS } from "./api";
import { apiPost } from "./apiClient";

export async function touchWalletSession(address) {
  if (!address) return;
  try {
    const candidates = [
      API_URLS?.auth?.walletSession || "/api/auth/wallet/session",
      "/api/v1/auth/wallet-session",
    ];

    for (let i = 0; i < candidates.length; i += 1) {
      const path = candidates[i];
      try {
        await apiPost(path, { address });
        return;
      } catch (e) {
        // try next candidate, but surface the final error
        if (i === candidates.length - 1) throw e;
      }
    }
  } catch (e) {
    if (process.env.NODE_ENV !== "production")
      console.warn("touchWalletSession failed", e);
  }
}
