import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TonConnectUIProvider } from "./hooks/safeTon";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { getTonManifestUrl } from "./utils/tonconnect";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={getTonManifestUrl()}>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </TonConnectUIProvider>
  </React.StrictMode>,
);
