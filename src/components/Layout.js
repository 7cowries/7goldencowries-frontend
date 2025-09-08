import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MagicLayers from './ui/MagicLayers';

export default function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-view">
        <Outlet />
      </main>
      <MagicLayers />
    </div>
  );
}
