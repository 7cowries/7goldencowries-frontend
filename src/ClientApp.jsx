import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import React from 'react';
import { BrowserRouter } from "react-router-dom";
import App from "./App"; // your existing app component

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
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
