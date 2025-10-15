import React from "react";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">{/* flex container so main area can grow */}
      <Sidebar />
      {/* Ambient layers */}
      <div id="magic-orbs">
        <div className="orb" />
        <div className="orb" />
        <div className="orb" />
        <div className="orb" />
      </div>
      <div className="veil" />
      {/* Main */}
      <main className="main-view">
        <div className="page">{children}</div>
      </main>
    </div>
  );
}
