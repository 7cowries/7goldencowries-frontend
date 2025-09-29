import React from 'react';
import { useWallet } from '../hooks/useWallet'; // CHANGE 1: Import our new hook
import './GlobalWalletButton.css';

function WalletConnect() {
    // CHANGE 2: Use our new, simple hook instead of the old context
    const { isConnected, connect, disconnect, wallet } = useWallet();

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    // NO OTHER CHANGES below this line. Your UI structure is preserved.
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
