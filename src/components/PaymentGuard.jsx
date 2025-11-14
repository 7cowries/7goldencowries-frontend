import React from "react";
import useWallet from "../hooks/useWallet";

/**
 * PaymentGuard
 * Thin pass-through wrapper so pages control all wallet messaging.
 */
export default function PaymentGuard({ children, loadingFallback }) {
  const state = useWallet() || {};
  const { isLoading } = state;

  // Optional: allow pages to show a loading placeholder if they passed one
  if (isLoading && loadingFallback) {
    return <>{loadingFallback}</>;
  }

  // Always render children; no internal "connect your wallet" text here.
  return <>{children}</>;
}
