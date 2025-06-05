import React from 'react';
import Header from './Header';
import { navigation } from '../config/navigation';
import ctLogo from '../assets/images/CT-logo.png';

interface NavigationProps {
    activeNavId?: number;
    isLoading?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ isLoading = false }) => {
    return (
        <Header
            logoSrc={ctLogo}
            logoAlt="CT-logo"
            logoText="CT SPARK"
            navItems={navigation}
            signInLink="/login"
            getStartedLink="/login?register=true"
        />
    );
};

export default Navigation; 