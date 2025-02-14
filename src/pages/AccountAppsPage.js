import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AccountSidebar from "../components/AccountSidebar";
import AccountDetailsMenu from "../components/AccountDetailsMenu";
import { usePermissions } from "../hooks/usePermissions";
import { message } from "antd";

// Default icon as a data URL - simple app icon placeholder
const defaultAppIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='64' height='64'%3E%3Cpath fill='%23ccc' d='M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z'/%3E%3C/svg%3E";

// Map backend app IDs to frontend app IDs
const APP_ID_MAP = {
    'task_manager': 'task_manager',
    'multi_control': 'multi_control',
    'inventory': 'inventory'
};

// Map app names to frontend app IDs
const APP_NAME_TO_ID = {
    'Task Manager': 'task_manager',
    'Multi-Control': 'multi_control',
    'MultiControl': 'multi_control',
    'Multi Control': 'multi_control',
    'Inventory': 'inventory'
};

const AccountAppsPage = () => {
    const { accountId } = useParams();
    const navigate = useNavigate();
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { canManageApps, hasAccountAccess, isAdmin } = usePermissions();
    const Sidebar = isAdmin() ? AdminSidebar : AccountSidebar;

    useEffect(() => {
        if (!hasAccountAccess()) {
            navigate('/login');
            return;
        }
        fetchApps();
    }, [accountId]);

    const fetchApps = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate('/login');
                return;
            }

            // Use the working endpoint format that matches the curl command
            const endpoint = `/apps/installed?account_id=${accountId}`;
            console.log('Fetching apps from endpoint:', endpoint);

            const response = await fetch(`https://verdan-api.onrender.com${endpoint}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    navigate('/login');
                    return;
                }
                if (response.status === 403) {
                    setError("You don't have permission to view this account's apps.");
                    setLoading(false);
                    return;
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch apps: ${response.status}`);
            }

            const data = await response.json();
            console.log('Fetched apps:', data);
            setApps(data);
            setError(""); // Clear any existing error when fetch is successful
            setLoading(false);
        } catch (error) {
            console.error("Error fetching apps:", error);
            setError(error.message || "Failed to load apps.");
            setLoading(false);
        }
    };

    const handleInstallApp = async (appId) => {
        if (!canManageApps()) {
            setError("You don't have permission to install apps.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found.");

            console.log('Installing app:', { appId, accountId });

            const response = await fetch(`https://verdan-api.onrender.com/admin/accounts/${accountId}/apps/install`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ app_id: appId })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to install app");
            }

            await fetchApps(); // Refresh the apps list after installation
            message.success(`${appId} app installed successfully`);
        } catch (error) {
            console.error("Error installing app:", error);
            setError(error.message || "Failed to install app.");
        }
    };

    const handleUninstallApp = async (appId) => {
        if (!canManageApps()) {
            setError("You don't have permission to uninstall apps.");
            return;
        }

        if (!window.confirm("Are you sure you want to uninstall this app?")) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found.");

            console.log('Uninstalling app:', { appId, accountId });

            const response = await fetch(`https://verdan-api.onrender.com/admin/accounts/${accountId}/apps/uninstall`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ app_id: appId })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to uninstall app");
            }

            await fetchApps(); // Refresh the apps list after uninstallation
            message.success(`${appId} app uninstalled successfully`);
        } catch (error) {
            console.error("Error uninstalling app:", error);
            setError(error.message || "Failed to uninstall app.");
        }
    };

    const handleAppClick = (app) => {
        console.log('Clicking app:', app);
        // Map the app name to our frontend app ID
        const frontendAppId = APP_NAME_TO_ID[app.name];
        if (!frontendAppId) {
            console.error('Unknown app name:', app.name);
            setError(`Unknown app type: ${app.name}`);
            return;
        }
        
        const route = isAdmin() 
            ? `/admin/accounts/${accountId}/apps/${frontendAppId}`
            : `/account/${accountId}/apps/${frontendAppId}`;
        
        console.log('Navigating to:', route);
        navigate(route);
    };

    if (loading) {
        return (
            <div className="admin-container">
                <Sidebar />
                <main className="content">
                    {isAdmin() && <AccountDetailsMenu />}
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading apps...</p>
                    </div>
                </main>
            </div>
        );
    }

    const isMultiControlInstalled = apps.some(app => app.id === 'multi_control');

    return (
        <div className="admin-container">
            <Sidebar />
            <main className="content">
                {isAdmin() && <AccountDetailsMenu />}
                <div className="apps-section">
                    <h2>Apps</h2>
                    {error && <p className="error-message">{error}</p>}
                    
                    {/* Installed Apps Section */}
                    <div className="installed-apps">
                        <h3>Installed Apps</h3>
                        {apps.length === 0 ? (
                            <div className="no-apps-container">
                                <p className="no-apps-message">No apps installed.</p>
                                {canManageApps() && (
                                    <p className="no-apps-subtext">
                                        Visit the <Link to="/apps">Apps page</Link> to install apps.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="apps-grid">
                                {apps.map((app) => (
                                    <div 
                                        key={app.id} 
                                        className="app-card installed"
                                        onClick={() => handleAppClick(app)}
                                    >
                                        <div className="app-icon">
                                            <img 
                                                src={app.icon_url || defaultAppIcon} 
                                                alt={`${app.name} icon`}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = defaultAppIcon;
                                                }}
                                            />
                                        </div>
                                        <div className="app-info">
                                            <h3>{app.name}</h3>
                                            <p>{app.description}</p>
                                        </div>
                                        {canManageApps() && (
                                            <div className="app-actions" onClick={e => e.stopPropagation()}>
                                                <button 
                                                    className="uninstall-app-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUninstallApp(app.id);
                                                    }}
                                                >
                                                    Uninstall
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AccountAppsPage; 