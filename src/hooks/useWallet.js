import React, { createContext, useState, useContext, useEffect } from 'react';
import { TonConnectUI, THEME } from '@tonconnect/ui';
import { fetchUserProfile } from '../utils/api';

export const tonConnectUI = new TonConnectUI({
    manifestUrl: 'https://sevengoldencowries.com/tonconnect-manifest.json',
    uiPreferences: { theme: THEME.DARK },
});

const WalletAndUserContext = createContext(null);

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

export const useWalletAndUser = () => {
    const context = useContext(WalletAndUserContext);
    if (!context) {
        throw new Error('useWalletAndUser must be used within a WalletAndUserProvider');
    }
    return context;
};
