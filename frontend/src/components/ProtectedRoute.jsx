import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="loading">Checking authentication...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (role && user.role !== role && user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;
