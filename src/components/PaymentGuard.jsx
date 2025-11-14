import React from "react";
import useWallet from "../hooks/useWallet";

type PaymentGuardProps = {
  children: React.ReactNode;
  loadingFallback?: React.ReactNode;
};

/**
 * PaymentGuard
 *
 * Old versions showed their own "Connect your wallet…" text here,
 * which could get out of sync with the global wallet pill.
 *
 * This version is a thin pass-through: pages themselves are
 * responsible for checking `useWallet()` and updating labels/buttons.
 * That keeps ALL wallet messaging consistent everywhere.
 */
export default function PaymentGuard({
  children,
  loadingFallback, // kept for compatibility, currently unused
}: PaymentGuardProps) {
  // We still read the wallet so React keeps this component in the tree
  // and we can extend it later if needed.
  const { wallet } = useWallet();
  void wallet; // avoid unused variable warnings

  return <>{children}</>;
}
