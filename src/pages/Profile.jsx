import React from 'react';
import { useWalletAndUser } from '../hooks/useWallet';
import XPBar from '../components/XPBar';
import './Profile.css';

const Profile = () => {
    const { user, isConnected, isLoadingUser } = useWalletAndUser();

    if (!isConnected) return <div className="profile-container disconnected">Please connect your wallet.</div>;
    if (isLoadingUser) return <div className="profile-container loading">Loading profile...</div>;
    if (!user) return <div className="profile-container error">Could not load user profile.</div>;

    return (
        <div className="profile-container">
            <h1 className="profile-header">Your Profile</h1>
            <div className="profile-card">
                <p><strong>XP:</strong> {user.xp}</p>
                <p><strong>Level:</strong> {user.level}</p>
                <XPBar xp={user.xp} level={user.level} />
            </div>
        </div>
    );
};

export default Profile;
