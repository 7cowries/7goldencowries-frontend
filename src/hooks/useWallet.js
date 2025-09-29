import { useState, useEffect } from 'react';
import { TonConnectUI, THEME } from '@tonconnect/ui';

// Initialize TonConnectUI once and export it for the whole app to use
export const tonConnectUI = new TonConnectUI({
    manifestUrl: 'https://sevengoldencowries.com/tonconnect-manifest.json',
    uiPreferences: {
        theme: THEME.DARK,
    },
    actionsConfiguration: {
        twaReturnUrl: 'https://t.me/SevenGoldenCowriesBot/app'
    }
});

export function useWallet() {
    const [wallet, setWallet] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Subscribe to any status changes from the wallet
        const unsubscribe = tonConnectUI.onStatusChange(
            (walletInfo) => {
                setWallet(walletInfo);
                setIsConnected(!!walletInfo); // true if walletInfo exists, false if not
            }
        );

        // Check the initial status when the app loads
        if (tonConnectUI.wallet) {
            setWallet(tonConnectUI.wallet);
        }
        setIsConnected(tonConnectUI.connected);

        // Cleanup the subscription when the component is no longer on screen
        return () => {
            unsubscribe();
        };
    }, []);

    return {
        wallet,
        isConnected,
        connect: () => tonConnectUI.openModal(),
        disconnect: () => tonConnectUI.disconnect(),
    };
}
