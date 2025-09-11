import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Close drawer on route change
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="app-layout">
      {/* Mobile drawer scrim */}
      <div className={`scrim ${open ? "show" : ""}`} onClick={() => setOpen(false)} />

      {/* Single, responsive sidebar */}
      <Sidebar open={open} />

      {/* Topbar + main */}
      <main className="main-view">
        <a className="skip-link" href="#main">Skip to content</a>
        <div className="app-topbar">
          <button
            className="menu-btn"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="brand">7 Golden Cowries</div>
        </div>

        <div id="main" className="page">{children}</div>
      </main>
    </div>
  );
}
