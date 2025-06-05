import { useState, useEffect } from 'react';
import { navigation } from '../config/navigation';
import type { NavItem } from '../config/navigation';

interface UseNavigationReturn {
    activeId: number;
    currentPath: string;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    handleNavClick: (path: string) => void;
}

export const useNavigation = (activeNavId?: number): UseNavigationReturn => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const [currentPath, setCurrentPath] = useState<string>('');
    const [activeId, setActiveId] = useState<number>(1);

    useEffect(() => {
        const path = window.location.pathname;
        setCurrentPath(path);

        const matchingItem = navigation.find(item => {
            if (item.path === '/' && path === '/') return true;
            if (item.path !== '/' && path.startsWith(item.path)) return true;
            return false;
        });

        if (matchingItem) {
            setActiveId(matchingItem.id);
        } else {
            setActiveId(0);
        }
    }, []);

    useEffect(() => {
        if (activeNavId !== undefined) {
            setActiveId(activeNavId);
        }
    }, [activeNavId]);

    const handleNavClick = (path: string) => {
        window.location.href = path;
        setIsMobileMenuOpen(false);
    };

    return {
        activeId,
        currentPath,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        handleNavClick
    };
}; 