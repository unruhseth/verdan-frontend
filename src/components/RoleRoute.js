import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../utils/api';

const RoleRoute = ({ requiredRoles }) => {
    const { isAuthenticated } = useAuth();
    
    // Check if we have a token
    const token = sessionStorage.getItem('access_token');
    if (!token) {
        console.log('RoleRoute: No token found, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    // Get user info from token claims
    try {
        const claims = authApi.getTokenClaims(token);
        if (!claims || !claims.role) {
            console.log('RoleRoute: Invalid token claims, redirecting to login');
            sessionStorage.removeItem('access_token');
            return <Navigate to="/login" replace />;
        }

        // Check if user's role is allowed
        const hasRequiredRole = requiredRoles.includes(claims.role);
        console.log('Role check:', {
            userRole: claims.role,
            requiredRoles,
            hasRequiredRole
        });

        if (!hasRequiredRole) {
            console.log('RoleRoute: Unauthorized role, redirecting to appropriate dashboard');
            
            // Redirect to appropriate dashboard based on role
            if (['master_admin', 'admin'].includes(claims.role)) {
                return <Navigate to="/admin/dashboard" replace />;
            } else {
                return <Navigate to={`/account/${claims.account_id}/dashboard`} replace />;
            }
        }

        // Allow access to the route
        return <Outlet />;
    } catch (error) {
        console.error('RoleRoute: Error checking token claims:', error);
        sessionStorage.removeItem('access_token');
        return <Navigate to="/login" replace />;
    }
};

export default RoleRoute; 