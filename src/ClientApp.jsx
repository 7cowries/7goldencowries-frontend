import React from "react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { TonConnectUIProvider } from "./hooks/safeTon";
import { ThemeProvider } from "./context/ThemeContext";

export default function ClientApp() {
  const manifestUrl =
    process.env.REACT_APP_TONCONNECT_MANIFEST_URL ||
    process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/tonconnect-manifest.json`
      : "/tonconnect-manifest.json");

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </TonConnectUIProvider>
  );
}
