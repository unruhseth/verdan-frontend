import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import DeleteAppButton from "../components/DeleteAppButton";
import { useAuth } from "../hooks/useAuth";
import { usePermissions } from "../hooks/usePermissions";

// Default icon as a data URL - simple app icon placeholder
const defaultAppIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='64' height='64'%3E%3Cpath fill='%23ccc' d='M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z'/%3E%3C/svg%3E";

// Available apps data
const availableApps = [
    {
        id: 'task_manager',
        name: 'Task Manager',
        description: 'Manage and track tasks across your organization',
        icon_url: defaultAppIcon,
        monthly_price: 9.99,
        yearly_price: 99.99
    },
    {
        id: 'multi_control',
        name: 'Multi-Control',
        description: 'Field and equipment management system',
        icon_url: defaultAppIcon,
        monthly_price: 19.99,
        yearly_price: 199.99
    },
    {
        id: 'inventory',
        name: 'Inventory',
        description: 'Track and manage your inventory items',
        icon_url: defaultAppIcon,
        monthly_price: 14.99,
        yearly_price: 149.99
    }
];

const AppsPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { isAdmin, userRole } = usePermissions();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState("");
    const [selectedApp, setSelectedApp] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [installStatus, setInstallStatus] = useState({ message: "", type: "" });

    // Debug logging
    console.log('AppsPage render:', { 
        isAuthenticated, 
        authLoading, 
        userRole,
        token: localStorage.getItem('token'),
        role: localStorage.getItem('role')
    });

    useEffect(() => {
        // Don't redirect while still loading auth state
        if (authLoading) {
            console.log('Still loading auth state...');
            return;
        }

        if (!isAuthenticated) {
            console.log('Not authenticated, redirecting to login');
            navigate('/login');
            return;
        }

        const role = localStorage.getItem('role');
        console.log('Current role:', role);

        if (!role || (role !== 'master_admin' && role !== 'admin')) {
            console.log('Not admin, redirecting to login');
            navigate('/login');
            return;
        }

        fetchAccounts();
    }, [isAuthenticated, authLoading, userRole]);

    const fetchAccounts = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.log('No token found, redirecting to login');
                navigate('/login');
                return;
            }

            const response = await fetch("http://localhost:5000/admin/accounts", {
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
                throw new Error("Failed to fetch accounts");
            }

            const data = await response.json();
            setAccounts(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching accounts:", error);
            setError("Failed to load accounts.");
            setLoading(false);
        }
    };

    const handleInstallClick = (app) => {
        setSelectedApp(app);
        setSelectedAccount("");
        setShowModal(true);
        setInstallStatus({ message: "", type: "" });
    };

    const handleInstallApp = async () => {
        if (!selectedAccount || !selectedApp) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found.");

            let endpoint;
            let body;
            if (selectedApp.id === 'multi_control') {
                endpoint = `/multi_controls/install`;
                body = { account_id: parseInt(selectedAccount) };
            } else {
                endpoint = `/admin/accounts/${selectedAccount}/apps/install`;
                body = { app_id: selectedApp.id };
            }

            const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Failed to install app");
            }

            setInstallStatus({
                message: `Successfully installed ${selectedApp.name} for the selected account.`,
                type: "success"
            });

            setTimeout(() => {
                setShowModal(false);
                setSelectedApp(null);
                setSelectedAccount("");
                setInstallStatus({ message: "", type: "" });
            }, 2000);

        } catch (error) {
            console.error("Error installing app:", error);
            setInstallStatus({
                message: error.message || "Failed to install app",
                type: "error"
            });
        }
    };

    if (loading) {
        return (
            <div className="admin-container">
                <AdminSidebar />
                <main className="content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading apps...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <AdminSidebar />
            <main className="content">
                <div className="apps-section">
                    <h2>Available Apps</h2>
                    <div className="apps-grid">
                        {availableApps.map((app) => (
                            <div key={app.id} className="app-card available">
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
                                    <div className="app-pricing">
                                        <p>Monthly: ${app.monthly_price}</p>
                                        <p>Yearly: ${app.yearly_price}</p>
                                    </div>
                                </div>
                                <div className="app-actions">
                                    <button 
                                        className="install-app-btn"
                                        onClick={() => handleInstallClick(app)}
                                    >
                                        Install
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Installation Modal */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Install {selectedApp?.name}</h3>
                            {installStatus.message && (
                                <p className={`status-message ${installStatus.type}`}>
                                    {installStatus.message}
                                </p>
                            )}
                            <div className="form-group">
                                <label>Select Account:</label>
                                <select 
                                    value={selectedAccount} 
                                    onChange={(e) => setSelectedAccount(e.target.value)}
                                >
                                    <option value="">Choose an account...</option>
                                    {accounts.map((account) => (
                                        <option key={account.id} value={account.id}>
                                            {account.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button 
                                    className="btn cancel"
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedApp(null);
                                        setSelectedAccount("");
                                        setInstallStatus({ message: "", type: "" });
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn install"
                                    onClick={handleInstallApp}
                                    disabled={!selectedAccount}
                                >
                                    Install
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AppsPage; 