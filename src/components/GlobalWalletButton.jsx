import React from "react";
// import WalletConnect from "./WalletConnect";
import "./GlobalWalletButton.css";

export default function GlobalWalletButton() {
  return (
    <div className="global-wallet-button">
      <WalletConnect className="global-embed" />
    </div>
  );
}
