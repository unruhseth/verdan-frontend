import React from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import RequireAuth from "./hooks/RequireAuth";
import { usePermissions } from "./hooks/usePermissions";
import 'antd/dist/reset.css';

// Import pages
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AccountsPage from "./pages/AccountsPage";
import CreateAccountPage from "./pages/CreateAccountPage";
import AccountDetailsPage from "./pages/AccountDetailsPage";
import AccountUsersPage from "./pages/AccountUsersPage";
import AccountUsersList from "./pages/AccountUsersList";
import AppsPage from "./pages/AppsPage";
import AccountAppsPage from "./pages/AccountAppsPage";
import DynamicAppLoader from "./components/DynamicAppLoader";

// Account Dashboard Redirect component
const AccountDashboardRedirect = () => {
  const { accountId } = useParams();
  return <Navigate to={`/account/${accountId}/dashboard`} replace />;
};

// Role-based route component
const RoleRoute = ({ element: Element, requiredRole, ...rest }) => {
  const { userRole, isLoading: permissionsLoading } = usePermissions();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const token = localStorage.getItem('token');
  const storedRole = localStorage.getItem('role');
  const accountId = localStorage.getItem('accountId');
  
  // Debug logging
  console.log('RoleRoute validation:', { 
    userRole, 
    storedRole,
    requiredRole, 
    token: token ? 'exists' : 'missing',
    accountId,
    isAuthenticated,
    permissionsLoading,
    authLoading,
    pathname: window.location.pathname
  });

  // If we're still loading auth or permissions, show loading state
  if (authLoading || permissionsLoading) {
    console.log('Still loading auth state...', { authLoading, permissionsLoading });
    return <div>Loading...</div>;
  }

  // If not authenticated or no token, redirect to login
  if (!isAuthenticated || !token) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  // Use either userRole from state or directly from localStorage
  const currentRole = userRole || storedRole;
  
  // If no role at all, redirect to login
  if (!currentRole) {
    console.error('No role found, redirecting to login');
    return <Navigate to="/login" />;
  }

  // For user accounts, verify we have an accountId
  if (['account_admin', 'user'].includes(currentRole)) {
    if (!accountId && accountId !== '0') {
      console.error('No account ID found for user account:', { 
        currentRole, 
        accountId,
        pathname: window.location.pathname 
      });
      return <Navigate to="/login" />;
    }
  }
  
  // Check if user's role is included in the required roles array
  const hasRequiredRole = Array.isArray(requiredRole) 
    ? requiredRole.includes(currentRole) 
    : requiredRole === currentRole;

  console.log('Role validation result:', {
    currentRole,
    requiredRole,
    hasRequiredRole,
    accountId
  });

  if (hasRequiredRole) {
    console.log('Access granted for role:', currentRole);
    return Element;
  }
  
  console.error('Access denied:', {
    currentRole,
    requiredRole,
    pathname: window.location.pathname
  });
  return <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<RequireAuth />}>
          {/* Admin Routes - Most specific first */}
          <Route path="/admin/accounts/:accountId/apps/:appId/*" element={
            <RoleRoute 
              element={<DynamicAppLoader />} 
              requiredRole={['master_admin', 'admin']} 
            />
          } />
          <Route path="/admin/accounts/:accountId/apps/*" element={
            <RoleRoute 
              element={<AccountAppsPage />} 
              requiredRole={['master_admin', 'admin']} 
            />
          } />
          <Route path="/admin/accounts/:accountId/users/*" element={
            <RoleRoute 
              element={<AccountUsersPage />} 
              requiredRole={['master_admin', 'admin', 'account_admin']} 
            />
          } />
          <Route path="/admin/accounts/:accountId/*" element={
            <RoleRoute 
              element={<AccountDetailsPage />} 
              requiredRole={['master_admin', 'admin']} 
            />
          } />
          <Route path="/admin/accounts/create" element={
            <RoleRoute 
              element={<CreateAccountPage />} 
              requiredRole={['master_admin', 'admin']} 
            />
          } />
          <Route path="/admin/accounts/*" element={
            <RoleRoute 
              element={<AccountsPage />} 
              requiredRole={['master_admin', 'admin']} 
            />
          } />
          <Route path="/admin/apps/*" element={
            <RoleRoute 
              element={<AppsPage />} 
              requiredRole={['master_admin', 'admin']} 
            />
          } />
          <Route path="/admin/*" element={
            <RoleRoute 
              element={<AdminDashboard />} 
              requiredRole={['master_admin', 'admin']} 
            />
          } />

          {/* Account Routes */}
          <Route path="/account/:accountId/apps/:appId/*" element={
            <RoleRoute 
              element={<DynamicAppLoader />} 
              requiredRole={['account_admin', 'user']} 
            />
          } />
          <Route path="/account/:accountId/apps/*" element={
            <RoleRoute 
              element={<AccountAppsPage />} 
              requiredRole={['account_admin', 'user']} 
            />
          } />
          <Route path="/account/:accountId/users/*" element={
            <RoleRoute 
              element={<AccountUsersList />} 
              requiredRole={['account_admin', 'user']} 
            />
          } />
          <Route path="/account/:accountId/dashboard/*" element={
            <RoleRoute 
              element={<AccountDetailsPage />} 
              requiredRole={['account_admin', 'user']} 
            />
          } />
          <Route path="/account/:accountId/*" element={<AccountDashboardRedirect />} />
        </Route>

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
