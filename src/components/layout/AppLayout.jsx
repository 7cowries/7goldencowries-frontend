import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";

export default function AppLayout({ children }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="app-layout">
      <div className={`scrim ${open ? "show" : ""}`} onClick={() => setOpen(false)} />
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <main className="main-view">
        <a className="skip-link" href="#main">Skip to content</a>
        <div className="app-topbar">
          <button className="menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
          <div className="brand">7 Golden Cowries</div>
        </div>
        <div id="main" className="page">{children}</div>
      </main>
    </div>
  );
}
