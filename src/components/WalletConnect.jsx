import React from 'react';
import { useWalletAndUser } from '../hooks/useWallet'; // Use the new unified hook
import './GlobalWalletButton.css';

function WalletConnect() {
    const { isConnected, connect, disconnect, wallet } = useWalletAndUser();

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="wallet-connect-container">
            {isConnected ? (
                <button className="wallet-button disconnect" onClick={disconnect}>
                    <span className="wallet-address">{formatAddress(wallet?.account?.address)}</span>
                    Disconnect
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
