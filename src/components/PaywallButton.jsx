// src/components/PaywallButton.jsx
import React, { useState } from "react";
import { getJSON } from "../utils/api";

/**
 * Simple paywall gate:
 * - Checks /api/me for subscription state
 * - If active -> call onUnlocked()
 * - Else -> route user to /subscription
 */
export default function PaywallButton({
  className = "",
  children = "Continue",
  onUnlocked,
  ...props
}) {
  const [busy, setBusy] = useState(false);

  const handleClick = async (e) => {
    e?.preventDefault?.();
    if (busy) return;
    setBusy(true);
    try {
      const me = await getJSON("/api/me"); // proxied to Render in dev
      const active =
        !!me?.subscription?.active || me?.tier === "Tier 1" || me?.tier === "Tier 2" || me?.tier === "Tier 3";
      if (active) {
        onUnlocked?.();
      } else {
        window.location.href = "/subscription";
      }
    } catch (err) {
      console.error("Paywall check failed:", err);
      window.location.href = "/subscription";
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={className}
      disabled={busy}
      onClick={handleClick}
      {...props}
    >
      {busy ? "Checking…" : children}
    </button>
  );
}
