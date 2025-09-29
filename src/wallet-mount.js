import React from "react";
import { createRoot } from "react-dom/client";
import GlobalWalletButton from "./components/GlobalWalletButton";

function mount() {
  try {
    const rootEl = document.getElementById("wallet-root");
    if (!rootEl) return;
    const root = createRoot(rootEl);
    root.render(<GlobalWalletButton />);
  } catch (e) {
    // don't crash app if mount fails
    // eslint-disable-next-line no-console
    console.warn("[wallet-mount] mount error", e);
  }
}

if (document.readyState === "complete" || document.readyState === "interactive") {
  mount();
} else {
  window.addEventListener("DOMContentLoaded", mount);
}
