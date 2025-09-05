import { bindWallet } from "./api";

let bound = null;

export async function ensureWalletBound(wallet) {
  if (!wallet || wallet === bound) return;
  bound = wallet;
  try {
    await bindWallet(wallet);
  } catch (e) {
    console.error("bind-wallet failed", e);
  }
}

