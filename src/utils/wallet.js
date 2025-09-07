export function getSavedWallet() {
  if (typeof window === "undefined") return null;
  try {
    return (
      localStorage.getItem("wallet") ||
      localStorage.getItem("ton_wallet") ||
      localStorage.getItem("walletAddress")
    );
  } catch {
    return null;
  }
}
