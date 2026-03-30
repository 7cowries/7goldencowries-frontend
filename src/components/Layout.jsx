import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./layout/Sidebar";
import { useTheme } from "../context/ThemeContext";
import useWallet from "../hooks/useWallet";

function pageLabel(pathname) {
  if (pathname === "/") return "Home";
  return pathname
    .replace(/^\//, "")
    .split("/")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" · ");
}

function shortWallet(addr) {
  if (!addr) return "Not connected";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function Layout({ children }) {
  const { theme } = useTheme();
  const location = useLocation();
  const { wallet, isConnected, connect, disconnect, isConnecting } = useWallet();

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  return (
    <div className={`app-layout theme-${theme}`}>
      <Sidebar />
      <div className="main-view">
        <header className="topbar glass-panel">
          <div>
            <p className="topbar-kicker">Seven Isles Command</p>
            <h2>{pageLabel(location.pathname)}</h2>
          </div>
          <div className="topbar-actions">
            <span className="status-chip">Tides: Stable</span>
            <button
              className={`wallet-chip ${isConnected ? "connected" : ""}`}
              onClick={isConnected ? disconnect : connect}
              disabled={isConnecting}
            >
              {isConnecting ? "Opening…" : isConnected ? shortWallet(wallet) : "Connect Wallet"}
            </button>
          </div>
        </header>

        <div className="main-scroll">{children}</div>
      </div>
    </div>
  );
}
