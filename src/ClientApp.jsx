import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import React from 'react';
import { BrowserRouter } from "react-router-dom";
import App from "./App"; // your existing app component
import { TonConnectUIProvider } from "./hooks/safeTon";
import { ThemeProvider } from "./context/ThemeContext";
import { getTonManifestUrl } from "./utils/tonconnect";

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

  return (
    <TonConnectUIProvider manifestUrl={getTonManifestUrl()}>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </TonConnectUIProvider>
  );
}
