import React from 'react';
import { NavLink } from 'react-router-dom';
import { useWalletAndUser } from '../../hooks/useWallet';
import WalletConnect from '../WalletConnect';
import './Sidebar.css';

const StatSkeleton = () => <div className="stat-skeleton"></div>;

function Sidebar() {
    const { user, isLoadingUser } = useWalletAndUser();

    const getLevelName = (level) => {
        const levels = ['Shellborn', 'Compassion', 'Courage', 'Creativity', 'Integrity', 'Vision', 'Wisdom'];
        return levels[level - 1] || 'Adventurer';
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <img src="/logo-cowrie-gold.svg" alt="Seven Golden Cowries" className="sidebar-logo" />
            </div>

            <div className="sidebar-profile">
                <h3 className="sidebar-profile-title">Your Progress</h3>
                <div className="sidebar-stats">
                    <div className="stat-item">
                        <span className="stat-label">Level</span>
                        {isLoadingUser ? <StatSkeleton /> : <span className="stat-value">{user ? getLevelName(user.level) : '--'}</span>}
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">XP</span>
                        {isLoadingUser ? <StatSkeleton /> : <span className="stat-value">{user ? `${user.xp} XP` : '--'}</span>}
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Home</NavLink>
                <NavLink to="/quests" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Quests</NavLink>
                <NavLink to="/leaderboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Leaderboard</NavLink>
                <NavLink to="/subscription" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Subscription</NavLink>
                <NavLink to="/token-sale" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Token Sale</NavLink>
                <NavLink to="/referral" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Referral</NavLink>
            </nav>

            <div className="sidebar-footer">
                <WalletConnect />
            </div>
        </aside>
    );
}

export default Sidebar;
