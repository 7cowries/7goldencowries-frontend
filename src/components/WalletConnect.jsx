import React from 'react';
import { useWallet } from '../hooks/useWallet';
import './GlobalWalletButton.css'; // Assuming this holds the button styles

function WalletConnect() {
    const { isConnected, connect, disconnect, wallet } = useWallet();

    // Function to format the wallet address to be shorter
    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="wallet-connect-container">
            {isConnected ? (
                <button className="wallet-button disconnect" onClick={disconnect}>
                    <span className="wallet-address">{formatAddress(wallet?.account?.address)}</span>
                    <span className="disconnect-text">Disconnect</span>
                </button>
            ) : (
                <button className="wallet-button connect" onClick={connect}>
                    Connect Wallet
                </button>
            )}
        </div>
    );
}

export default WalletConnect;
