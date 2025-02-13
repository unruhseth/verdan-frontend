import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import AdminSidebar from './AdminSidebar';
import AccountSidebar from './AccountSidebar';
import { usePermissions } from '../hooks/usePermissions';

// Lazy load the apps
const TaskManagerApp = lazy(() => import('../pages/apps/task-manager/TaskManagerApp'));
const MultiControlPage = lazy(() => import('../pages/apps/multi-control/MultiControlPage'));
const MultiControlEquipment = lazy(() => import('../pages/apps/multi-control/MultiControlEquipment'));
const MultiControlAlerts = lazy(() => import('../pages/apps/multi-control/MultiControlAlerts'));
const MultiControlDashboard = lazy(() => import('../pages/apps/multi-control/MultiControlDashboard'));
const InventoryPageWrapper = lazy(() => import('../pages/apps/inventory/InventoryPage'));

// Map of app IDs to their components and sub-routes
const appConfigs = {
    task_manager: {
        main: TaskManagerApp,
        routes: {}
    },
    multi_control: {
        main: MultiControlPage,
        routes: {
            'equipment': MultiControlEquipment,
            'alerts': MultiControlAlerts,
            ':fieldId': MultiControlDashboard
        }
    },
    inventory: {
        main: InventoryPageWrapper,
        routes: {}
    }
};

const DynamicAppLoader = () => {
    const { accountId, appId, '*': subPath } = useParams();
    const navigate = useNavigate();
    const { isAdmin, hasAccountAccess, userRole } = usePermissions();
    const token = localStorage.getItem('token');
    const Sidebar = isAdmin() ? AdminSidebar : AccountSidebar;

    useEffect(() => {
        // Check authentication and access rights
        if (!token) {
            navigate('/login');
            return;
        }

        if (!hasAccountAccess()) {
            navigate('/login');
            return;
        }
    }, [token, accountId, appId]);

    // Debug logging
    console.log('Loading app:', { appId, subPath });
    console.log('Available apps:', Object.keys(appConfigs));

    const appConfig = appConfigs[appId];
    if (!appConfig) {
        return (
            <div className="admin-container">
                <Sidebar />
                <main className="content">
                    <div>App not found: {appId}</div>
                    <div>Available apps: {Object.keys(appConfigs).join(', ')}</div>
                </main>
            </div>
        );
    }

    // Determine which component to load based on the sub-path
    let Component = appConfig.main;
    if (subPath) {
        const subRoute = Object.entries(appConfig.routes)
            .find(([pattern]) => {
                // Convert route pattern to regex
                const regexPattern = pattern
                    .replace(/:[^\s/]+/g, '([^/]+)')
                    .replace(/\*/g, '.*');
                return new RegExp(`^${regexPattern}$`).test(subPath);
            });
        
        if (subRoute) {
            Component = subRoute[1];
        }
    }

    return (
        <div className="admin-container">
            <Sidebar />
            <main className="content">
                <div className="multi-control-nav">
                    {appId === 'multi_control' && (
                        <nav className="app-nav">
                            <button 
                                className={!subPath ? 'active' : ''}
                                onClick={() => navigate(isAdmin() 
                                    ? `/admin/accounts/${accountId}/apps/multi_control`
                                    : `/account/${accountId}/apps/multi_control`)}
                            >
                                Fields
                            </button>
                            <button 
                                className={subPath === 'equipment' ? 'active' : ''}
                                onClick={() => navigate(isAdmin()
                                    ? `/admin/accounts/${accountId}/apps/multi_control/equipment`
                                    : `/account/${accountId}/apps/multi_control/equipment`)}
                            >
                                Equipment
                            </button>
                            <button 
                                className={subPath === 'alerts' ? 'active' : ''}
                                onClick={() => navigate(isAdmin()
                                    ? `/admin/accounts/${accountId}/apps/multi_control/alerts`
                                    : `/account/${accountId}/apps/multi_control/alerts`)}
                            >
                                Alerts
                            </button>
                        </nav>
                    )}
                </div>
                <Suspense fallback={
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <CircularProgress />
                    </Box>
                }>
                    <Component />
                </Suspense>
            </main>
        </div>
    );
};

export default DynamicAppLoader; 