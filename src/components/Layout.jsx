import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MagicLayers from './ui/MagicLayers';

export default function Layout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="app-layout">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <main className="main-view">
        {/* mobile open button sits in content top-left */}
        <div className="topbar-home">
          <button className="menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">☰ Menu</button>
        </div>
        <Outlet />
      </main>
      <MagicLayers />
    </div>
  );
}
