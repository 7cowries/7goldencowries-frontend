import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TonConnectUIProvider } from "./hooks/safeTon";
import App from "./App";

const manifestUrl =
  process.env.REACT_APP_TONCONNECT_MANIFEST_URL ||
  process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL ||
  (typeof window !== "undefined"
    ? `${window.location.origin}/tonconnect-manifest.json`
    : "/tonconnect-manifest.json");

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </TonConnectUIProvider>
  </React.StrictMode>
);
