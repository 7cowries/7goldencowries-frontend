import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import React from 'react';
import { BrowserRouter } from "react-router-dom";
import App from "./App"; // your existing app component
import { TonConnectUIProvider } from "./hooks/safeTon";
import WalletProvider from "./context/WalletContext";
import { ThemeProvider } from "./context/ThemeContext";

export default function ClientApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const close = () => setMenuOpen(false);
    router.events?.on("routeChangeStart", close);
    return () => router.events?.off("routeChangeStart", close);
  }, [router.events]);
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = menuOpen ? "hidden" : "";
    }
  }, [menuOpen]);

  const manifestUrl =
    process.env.REACT_APP_TONCONNECT_MANIFEST_URL ||
    process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/tonconnect-manifest.json`
      : "/tonconnect-manifest.json");

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <WalletProvider>
        <ThemeProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </WalletProvider>
    </TonConnectUIProvider>
  );
}
