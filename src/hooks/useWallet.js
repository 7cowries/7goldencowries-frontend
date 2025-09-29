import { useState, useEffect } from 'react';
import { TonConnectUI, THEME } from '@tonconnect/ui';

// Initialize TonConnectUI once and export it for the whole app to use
export const tonConnectUI = new TonConnectUI({
    manifestUrl: 'https://sevengoldencowries.com/tonconnect-manifest.json',
    uiPreferences: { theme: THEME.DARK },
    actionsConfiguration: {
        twaReturnUrl: 'https://t.me/SevenGoldenCowriesBot/app'
    }
});

// This is our new, stable hook
export function useWallet() {
    const [wallet, setWallet] = useState(null);

    useEffect(() => {
        // This function will run whenever the wallet's status changes
        const unsubscribe = tonConnectUI.onStatusChange(walletInfo => {
            setWallet(walletInfo);
        });

        // Set the initial wallet info when the app loads
        if (tonConnectUI.wallet) {
            setWallet(tonConnectUI.wallet);
        }

        // Cleanup function to prevent memory leaks
        return () => unsubscribe();
    }, []);

    return {
        wallet, // The user's wallet information
        isConnected: !!wallet, // A simple boolean: true if wallet exists, false if not
        connect: () => tonConnectUI.openModal(),
        disconnect: () => tonConnectUI.disconnect(),
    };
}
