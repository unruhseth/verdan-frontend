import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ConfigProvider, Layout } from 'antd';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { usePermissions } from "./hooks/usePermissions";
import RequireAuth from './hooks/RequireAuth';
import AdminSidebar from './components/AdminSidebar';
import AccountSidebar from './components/AccountSidebar';
import { getThemeConfig } from './theme';
import { authApi } from './utils/api';
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
import SettingsPage from "./pages/SettingsPage";

const { Content } = Layout;

// Account Dashboard Redirect component
const AccountDashboardRedirect = () => {
    const { accountId } = useParams();
    return <Navigate to={`/account/${accountId}/dashboard`} replace />;
};

// Layout component to wrap pages with sidebar
const PageLayout = ({ children }) => {
    const { isAdmin } = usePermissions();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const Sidebar = isAdmin() ? AdminSidebar : AccountSidebar;

    return (
        <Layout>
            <Sidebar />
            <Layout style={{ 
                marginLeft: isMobile ? 0 : 250,
                minHeight: '100vh',
                transition: 'margin-left 0.2s'
            }}>
                <Content style={{ 
                    minHeight: '100vh',
                    paddingTop: isMobile ? '64px' : 0 // Add padding for mobile to account for the hamburger menu
                }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

// Role-based route component
const RoleRoute = ({ element: Element, requiredRole, ...rest }) => {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const token = sessionStorage.getItem('access_token');
    const userInfoStr = sessionStorage.getItem('userInfo');
    
    if (authLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated || !token || !userInfoStr) {
        return <Navigate to="/login" />;
    }

    try {
        const userInfo = JSON.parse(userInfoStr);
        const userRole = userInfo.role;

        const hasRequiredRole = Array.isArray(requiredRole) 
            ? requiredRole.includes(userRole) 
            : requiredRole === userRole;

        // Get current path and target path
        const currentPath = window.location.pathname;
        const defaultPath = ['master_admin', 'admin'].includes(userRole)
            ? '/admin/dashboard'
            : `/account/${userInfo.accountId}/dashboard`;

        // Only redirect if:
        // 1. User doesn't have required role AND
        // 2. We're not already on the default path AND
        // 3. We're not in an infinite loop
        if (!hasRequiredRole && currentPath !== defaultPath && !currentPath.includes(defaultPath)) {
            return <Navigate to={defaultPath} replace />;
        }

        // If we get here, either:
        // 1. User has the required role OR
        // 2. We're already on the correct dashboard
        return (
            <PageLayout>
                <Element />
            </PageLayout>
        );
    } catch (error) {
        console.error('RoleRoute: Error checking user info:', error);
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('userInfo');
        return <Navigate to="/login" replace />;
    }
};

const App = () => {
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        const handleThemeChange = () => {
            setIsDarkMode(localStorage.getItem('theme') === 'dark');
        };

        window.addEventListener('themeChange', handleThemeChange);
        return () => window.removeEventListener('themeChange', handleThemeChange);
    }, []);

    return (
        <ConfigProvider theme={getThemeConfig(isDarkMode)}>
            <AuthProvider>
                <Routes>
                    {/* Public Route */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected Routes */}
                    <Route element={<RequireAuth />}>
                        {/* Admin Routes */}
                        <Route
                            path="/admin/dashboard"
                            element={
                                <RoleRoute
                                    element={AdminDashboard}
                                    requiredRole={['master_admin', 'admin']}
                                />
                            }
                        />
                        <Route
                            path="/admin/accounts"
                            element={
                                <RoleRoute
                                    element={AccountsPage}
                                    requiredRole={['master_admin', 'admin']}
                                />
                            }
                        />
                        <Route
                            path="/admin/apps"
                            element={
                                <RoleRoute
                                    element={AppsPage}
                                    requiredRole={['master_admin', 'admin']}
                                />
                            }
                        />
                        <Route
                            path="/admin/settings"
                            element={
                                <RoleRoute
                                    element={SettingsPage}
                                    requiredRole={['master_admin', 'admin']}
                                />
                            }
                        />
                        <Route
                            path="/admin/accounts/:accountId/apps/:appId/*"
                            element={
                                <RoleRoute
                                    element={DynamicAppLoader}
                                    requiredRole={['master_admin', 'admin']}
                                />
                            }
                        />
                        <Route
                            path="/admin/accounts/:accountId/apps/*"
                            element={
                                <RoleRoute
                                    element={AccountAppsPage}
                                    requiredRole={['master_admin', 'admin']}
                                />
                            }
                        />
                        <Route
                            path="/admin/accounts/:accountId/users/*"
                            element={
                                <RoleRoute
                                    element={AccountUsersPage}
                                    requiredRole={['master_admin', 'admin', 'account_admin']}
                                />
                            }
                        />
                        <Route
                            path="/admin/accounts/:accountId/*"
                            element={
                                <RoleRoute
                                    element={AccountDetailsPage}
                                    requiredRole={['master_admin', 'admin']}
                                />
                            }
                        />
                        <Route
                            path="/admin/accounts/create"
                            element={
                                <RoleRoute
                                    element={CreateAccountPage}
                                    requiredRole={['master_admin', 'admin']}
                                />
                            }
                        />
                        <Route
                            path="/admin/accounts/*"
                            element={
                                <RoleRoute
                                    element={AccountsPage}
                                    requiredRole={['master_admin', 'admin']}
                                />
                            }
                        />
                        <Route
                            path="/admin/apps/*"
                            element={
                                <RoleRoute
                                    element={AppsPage}
                                    requiredRole={['master_admin', 'admin']}
                                />
                            }
                        />
                        <Route
                            path="/admin/*"
                            element={
                                <RoleRoute
                                    element={AdminDashboard}
                                    requiredRole={['master_admin', 'admin']}
                                />
                            }
                        />

                        {/* Account Routes */}
                        <Route
                            path="/account/:accountId/apps/:appId/*"
                            element={
                                <RoleRoute
                                    element={DynamicAppLoader}
                                    requiredRole={['account_admin', 'user']}
                                />
                            }
                        />
                        <Route
                            path="/account/:accountId/apps/*"
                            element={
                                <RoleRoute
                                    element={AccountAppsPage}
                                    requiredRole={['account_admin', 'user']}
                                />
                            }
                        />
                        <Route
                            path="/account/:accountId/users/*"
                            element={
                                <RoleRoute
                                    element={AccountUsersList}
                                    requiredRole={['account_admin', 'user']}
                                />
                            }
                        />
                        <Route
                            path="/account/:accountId/settings"
                            element={
                                <RoleRoute
                                    element={SettingsPage}
                                    requiredRole={['account_admin']}
                                />
                            }
                        />
                        <Route
                            path="/account/:accountId/dashboard/*"
                            element={
                                <RoleRoute
                                    element={AccountDetailsPage}
                                    requiredRole={['account_admin', 'user']}
                                />
                            }
                        />
                        <Route
                            path="/account/:accountId/*"
                            element={<AccountDashboardRedirect />}
                        />
                    </Route>

                    {/* Default Redirect */}
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </AuthProvider>
        </ConfigProvider>
    );
};

export default App;
