import { ensureWalletBound } from "./walletBind";

let _last = 0;
const DEBOUNCE_MS = 2000; // 2 seconds

export function ensureWalletBoundDebounced(wallet) {
  const now = Date.now();
  // if last bind was within debounce window, skip
  if (_last && now - _last < DEBOUNCE_MS) {
    return Promise.resolve(null);
  }
  _last = now;
  return ensureWalletBound(wallet);
}

export default ensureWalletBoundDebounced;
