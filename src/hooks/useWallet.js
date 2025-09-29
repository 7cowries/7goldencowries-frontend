import React, { createContext, useState, useContext, useEffect } from 'react';
import { TonConnectUI, THEME } from '@tonconnect/ui';
import { fetchUserProfile } from '../utils/api';

// 1. Initialize TON Connect UI once for the entire app
export const tonConnectUI = new TonConnectUI({
    manifestUrl: 'https://sevengoldencowries.com/tonconnect-manifest.json',
    uiPreferences: { theme: THEME.DARK },
    actionsConfiguration: {
        twaReturnUrl: 'https://t.me/SevenGoldenCowriesBot/app'
    }
});

// 2. Create a single context for both Wallet and User data
const WalletAndUserContext = createContext(null);

// 3. Create the Provider that will manage all the data
export const WalletAndUserProvider = ({ children }) => {
    const [wallet, setWallet] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(false);

    useEffect(() => {
        const handleStatusChange = async (walletInfo) => {
            setWallet(walletInfo);
            if (walletInfo) {
                setIsLoadingUser(true);
                try {
                    const userData = await fetchUserProfile(walletInfo.account.address);
                    setUser(userData);
                } catch (error) {
                    console.error("Failed to fetch user profile:", error);
                    setUser(null);
                } finally {
                    setIsLoadingUser(false);
                }
            } else {
                setUser(null);
            }
        };

        const unsubscribe = tonConnectUI.onStatusChange(handleStatusChange);

        // Immediately check and set initial state on load
        handleStatusChange(tonConnectUI.wallet || null);

        return () => unsubscribe();
    }, []);

    const value = {
        wallet,
        user,
        isLoadingUser,
        isConnected: !!wallet,
        connect: () => tonConnectUI.openModal(),
        disconnect: () => tonConnectUI.disconnect(),
    };

    return (
        <WalletAndUserContext.Provider value={value}>
            {children}
        </WalletAndUserContext.Provider>
    );
};

// 4. Create the final, easy-to-use hook for all components
export const useWalletAndUser = () => {
    const context = useContext(WalletAndUserContext);
    if (!context) {
        throw new Error('useWalletAndUser must be used within a WalletAndUserProvider');
    }
    return context;
};
