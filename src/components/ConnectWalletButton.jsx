import React from "react";
import { TonConnectButton } from "../hooks/safeTon";
import useWallet from "../hooks/useWallet";

function ConnectWalletButton({ className = "" }) {
  const { connect } = useWallet();

  return (
    <div className={`connect-wallet-button ${className}`.trim()}>
      <TonConnectButton onClick={connect} />
    </div>
  );
}

export default ConnectWalletButton;
