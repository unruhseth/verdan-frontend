import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

const RequireAuth = () => {
    const location = useLocation();
    const { isAuthenticated, isLoading } = useAuth();
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Debug logging
    console.log('RequireAuth check:', { 
        isAuthenticated, 
        isLoading, 
        token: token ? 'exists' : 'missing',
        role,
        path: location.pathname,
        state: location.state
    });

    // Show loading state while checking authentication
    if (isLoading) {
        console.log('Auth is still loading, showing loading state...');
        return <div>Loading...</div>;
    }

    // If not authenticated at all, redirect to login
    if (!isAuthenticated || !token) {
        console.log('Authentication check failed:', {
            isAuthenticated,
            hasToken: !!token,
            role,
            redirectingTo: '/login'
        });
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated, allow access to the route
    console.log('Authentication successful, allowing access');
    return <Outlet />;
};

export default RequireAuth;
