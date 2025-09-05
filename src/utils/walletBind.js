import { bindWallet } from "./api";

// Wallet we have successfully bound on this page/session
let lastSuccessWallet = null;
// In-flight promises per wallet to prevent duplicate POSTs
const inflight = new Map();

/**
 * Ensure the connected wallet is bound to the server session.
 * Idempotent and safe to call repeatedly. Concurrent calls are deduped.
 */
export async function ensureWalletBound(wallet) {
  if (!wallet) return;
  if (wallet === lastSuccessWallet) return; // already bound successfully

  // Reuse the current in-flight request for this wallet if present
  if (inflight.has(wallet)) {
    try {
      await inflight.get(wallet);
    } catch {
      // swallow; caller may call again later
    }
    return;
  }

  const p = (async () => {
    try {
      await bindWallet(wallet);        // server should be idempotent
      lastSuccessWallet = wallet;      // cache ONLY after success
    } finally {
      inflight.delete(wallet);         // always clear to allow future retries
    }
  })();

  inflight.set(wallet, p);
  try {
    await p;
  } catch (e) {
    console.error("[wallet] bind failed:", e?.message || e);
    // do not set lastSuccessWallet on failure; future calls will retry
  }
}
