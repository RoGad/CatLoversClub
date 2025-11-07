import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../global/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/Login" replace />;
    }

    return children;
};

export default ProtectedRoute;

