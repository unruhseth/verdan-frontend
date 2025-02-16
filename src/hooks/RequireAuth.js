import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

const RequireAuth = ({ allowedRoles = [] }) => {
    const location = useLocation();
    const { isLoading } = useAuth();

    // Get stored auth data
    const token = sessionStorage.getItem('access_token');
    const userInfoStr = sessionStorage.getItem('userInfo');
    
    console.log('RequireAuth check:', { 
        hasToken: !!token,
        hasUserInfo: !!userInfoStr,
        path: location.pathname,
        allowedRoles
    });

    // Show loading state while checking authentication
    if (isLoading) {
        console.log('Auth is still loading...');
        return <div>Loading...</div>;
    }

    // If no token or user info, redirect to login
    if (!token || !userInfoStr) {
        console.log('Missing token or user info, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    try {
        // Parse user info
        const userInfo = JSON.parse(userInfoStr);
        
        // Validate user info
        if (!userInfo || !userInfo.role || !userInfo.accountId) {
            console.error('Invalid user info:', userInfo);
            // Clear invalid session data
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('userInfo');
            return <Navigate to="/login" state={{ from: location }} replace />;
        }

        // Check role authorization if roles are specified
        if (allowedRoles.length > 0 && !allowedRoles.includes(userInfo.role)) {
            console.error('Unauthorized role:', {
                userRole: userInfo.role,
                allowedRoles,
                path: location.pathname
            });
            return <Navigate to="/unauthorized" replace />;
        }

        console.log('Authentication successful:', {
            role: userInfo.role,
            accountId: userInfo.accountId,
            isAuthorized: allowedRoles.length === 0 || allowedRoles.includes(userInfo.role)
        });

        // If everything is valid, allow access to the route
        return <Outlet />;
    } catch (error) {
        console.error('Error parsing user info:', error);
        // Clear invalid session data
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('userInfo');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
};

export default RequireAuth;
