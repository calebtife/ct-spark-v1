import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface RouteGuardProps {
    children: React.ReactNode;
    isAuthenticated: boolean;
    redirectPath?: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({
    children,
    isAuthenticated,
    redirectPath = '/login'
}) => {
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default RouteGuard; 