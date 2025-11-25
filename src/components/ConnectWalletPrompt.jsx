import React from "react";
import ConnectWalletButton from "./ConnectWalletButton";

function ConnectWalletPrompt({ message = "Connect your TON wallet to continue." }) {
  return (
    <div className="glass-strong connect-wallet-cta">
      <p className="subtitle">{message}</p>
      <ConnectWalletButton className="cta-button" />
    </div>
  );
}

export default ConnectWalletPrompt;
