import React from 'react';
import Header from './Header';
import { navigation } from '../config/navigation';
import ctLogo from '../assets/images/CT-logo.png';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../services/firebase';

interface NavigationProps {
    activeNavId?: number;
    isLoading?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ isLoading = false }) => {
    const { currentUser } = useAuth();

    const handleLogout = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <Header
            logoSrc={ctLogo}
            logoAlt="CT-logo"
            logoText="CT SPARK"
            navItems={navigation}
            signInLink="/login"
            getStartedLink="/login?register=true"
            currentUser={currentUser}
            onLogout={handleLogout}
        />
    );
};

export default Navigation; 