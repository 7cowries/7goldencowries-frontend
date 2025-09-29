import React from 'react';
import { useWalletAndUser } from '../hooks/useWallet';
import XPBar from '../components/XPBar';
import './Profile.css';

const Profile = () => {
    const { user, wallet, isConnected, isLoadingUser } = useWalletAndUser();

    if (!isConnected) {
        return <div className="profile-container disconnected">Please connect your wallet to view your profile.</div>;
    }

    if (isLoadingUser) {
        return <div className="profile-container loading">Loading your profile...</div>;
    }

    if (!user) {
        return <div className="profile-container error">Could not load user profile. Please try reconnecting.</div>;
    }

    return (
        <div className="profile-container">
            <h1 className="profile-header">Your Profile</h1>
            <div className="profile-card">
                <div className="profile-info">
                    <p><strong>Wallet:</strong> {wallet?.account?.address}</p>
                    <p><strong>XP:</strong> {user.xp}</p>
                    <p><strong>Level:</strong> {user.level}</p>
                </div>
                <div className="profile-xp-bar">
                    <XPBar xp={user.xp} level={user.level} />
                </div>
            </div>
        </div>
    );
};

export default Profile;
