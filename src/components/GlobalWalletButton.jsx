import React from "react";
import ConnectWalletButton from "./ConnectWalletButton";
import "./GlobalWalletButton.css";

export default function GlobalWalletButton() {
  return (
    <div className="global-wallet-button">
      <ConnectWalletButton className="global-embed" />
    </div>
  );
}
