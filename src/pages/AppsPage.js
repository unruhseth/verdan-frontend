import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Button, Modal, Select, message, Space, Alert, Spin, App } from 'antd';
import DeleteAppButton from "../components/DeleteAppButton";
import { useAuth } from "../hooks/useAuth";
import { usePermissions } from "../hooks/usePermissions";
import api, { appManagementApi } from '../utils/api';

const { Option } = Select;

// Default icon as a data URL - simple app icon placeholder
const defaultAppIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='64' height='64'%3E%3Cpath fill='%23ccc' d='M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z'/%3E%3C/svg%3E";

const AppsPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { isAdmin, isLoading: permissionsLoading } = usePermissions();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState("");
    const [selectedApp, setSelectedApp] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [installStatus, setInstallStatus] = useState({ message: "", type: "" });
    const [messageApi, contextHolder] = message.useMessage();
    const [installedApps, setInstalledApps] = useState([]);
    const [availableApps, setAvailableApps] = useState([]);

    const showMessage = (type, content) => {
        messageApi[type](content);
    };

    // Add new function to fetch available apps
    const fetchAvailableApps = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/apps');
            // Add pricing information (this should ideally come from the backend)
            const appsWithPricing = response.data.map(app => ({
                ...app,
                icon_url: app.icon_url || defaultAppIcon,
                monthly_price: app.monthly_price || 9.99,
                yearly_price: app.yearly_price || 99.99
            }));
            setAvailableApps(appsWithPricing);
            setError("");
        } catch (err) {
            console.error("Error fetching available apps:", err);
            setError("Failed to load available apps.");
            showMessage('error', "Failed to load available apps. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            // Skip if already loading
            if (loading) {
                return;
            }

            // Wait for auth and permissions to load
            if (authLoading || permissionsLoading) {
                return;
            }

            // Check authentication and admin status
            if (!isAuthenticated) {
                navigate('/login');
                return;
            }

            if (!isAdmin()) {
                setError('You do not have permission to view this page');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Fetch accounts and available apps in parallel
                await Promise.all([
                    (async () => {
                        const accountsResponse = await api.get('/accounts/');
                        setAccounts(accountsResponse.data);
                    })(),
                    fetchAvailableApps()
                ]);
                setError("");
            } catch (err) {
                console.error("Error loading data:", err);
                setError("Failed to load data.");
                showMessage('error', "Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        // Only load data if we're authenticated and have permissions loaded
        if (isAuthenticated && !authLoading && !permissionsLoading) {
            loadData();
        }
    }, [isAuthenticated, isAdmin, authLoading, permissionsLoading, navigate]);

    // Add a function to fetch installed apps
    const fetchInstalledApps = async (accountId) => {
        try {
            setLoading(true);
            const response = await appManagementApi.listInstalledApps(accountId);
            setInstalledApps(response.data || []);
        } catch (error) {
            console.error("Error fetching installed apps:", error);
            // Show a user-friendly error message
            showMessage('warning', 'Unable to fetch installed apps. Installation checks may not be accurate.');
            // Set empty array to allow installations to proceed
            setInstalledApps([]);
        } finally {
            setLoading(false);
        }
    };

    // Update loadData to also fetch installed apps when an account is selected
    useEffect(() => {
        if (selectedAccount) {
            fetchInstalledApps(selectedAccount);
        }
    }, [selectedAccount]);

    // Show loading state while auth or permissions are loading
    if (authLoading || permissionsLoading || loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    // Show error if not admin
    if (!isAdmin()) {
        return (
            <Alert
                message="Access Denied"
                description="You do not have permission to view this page."
                type="error"
                showIcon
                style={{ margin: '24px' }}
            />
        );
    }

    const handleInstallClick = (app) => {
        setSelectedApp(app);
        setSelectedAccount("");
        setShowModal(true);
        setInstallStatus({ message: "", type: "" });
    };

    const handleInstallApp = async () => {
        if (!selectedAccount || !selectedApp) {
            showMessage('warning', "Please select an account first");
            return;
        }

        const accountId = parseInt(selectedAccount);
        const appId = selectedApp.id;

        // Modified check for already installed apps
        const isAlreadyInstalled = installedApps.some(app => 
            app.id === appId || 
            app.uuid === appId || // Check both id and uuid
            app.name === selectedApp.name
        );
        
        if (isAlreadyInstalled) {
            showMessage('warning', `${selectedApp.name} is already installed for this account`);
            setShowModal(false);
            setSelectedApp(null);
            setSelectedAccount("");
            return;
        }

        try {
            setLoading(true);
            console.log('Installing app:', { accountId, appId, appName: selectedApp.name });
            
            const result = await appManagementApi.installApp(accountId, appId);
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to install app');
            }
            
            // Show success message and update UI
            const successMessage = result.data?.message || `Successfully installed ${selectedApp.name}`;
            showMessage('success', successMessage);
            
            // Show warning if there was one
            if (result.data?.warning) {
                setTimeout(() => {
                    showMessage('warning', result.data.warning);
                }, 100);
            }
            
            // Close modal and reset state
            setShowModal(false);
            setSelectedApp(null);
            setSelectedAccount("");
            setInstallStatus({ message: "", type: "" });
            
            // Refresh the installed apps list
            await fetchInstalledApps(accountId);
        } catch (error) {
            console.error("Error installing app:", error);
            const errorMessage = error.message || "Failed to install app";
            showMessage('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Add function to handle app deletion
    const handleDeleteApp = async (app) => {
        try {
            setLoading(true);
            await api.delete(`/admin/apps/${app.id}`);
            showMessage('success', `Successfully deleted ${app.name}`);
            // Refresh the available apps list
            await fetchAvailableApps();
        } catch (err) {
            console.error("Error deleting app:", err);
            showMessage('error', `Failed to delete ${app.name}. Please try again later.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <App>
            {contextHolder}
            <div style={{ padding: '24px' }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '24px' 
                }}>
                    <h2 style={{ margin: 0 }}>Apps</h2>
                </div>

                {error && (
                    <Alert
                        message="Error"
                        description={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: '24px' }}
                    />
                )}
                
                <div style={{ marginBottom: '24px' }}>
                    <h3>Available Apps</h3>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '16px'
                    }}>
                        {availableApps.map((app) => (
                            <Card key={app.id}>
                                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                    <img 
                                        src={app.icon_url || defaultAppIcon} 
                                        alt={`${app.name} icon`}
                                        style={{ width: '64px', height: '64px' }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = defaultAppIcon;
                                        }}
                                    />
                                </div>
                                <h4>{app.name}</h4>
                                <p>{app.description}</p>
                                <div style={{ marginBottom: '16px' }}>
                                    <p>Monthly: ${app.monthly_price}</p>
                                    <p>Yearly: ${app.yearly_price}</p>
                                </div>
                                <Space>
                                    <Button 
                                        type="primary"
                                        onClick={() => handleInstallClick(app)}
                                    >
                                        Install
                                    </Button>
                                    <Button 
                                        type="primary"
                                        danger
                                        onClick={() => handleDeleteApp(app)}
                                    >
                                        Delete
                                    </Button>
                                </Space>
                            </Card>
                        ))}
                    </div>
                </div>

                <Modal
                    title={`Install ${selectedApp?.name}`}
                    open={showModal}
                    onCancel={() => {
                        setShowModal(false);
                        setSelectedApp(null);
                        setSelectedAccount("");
                    }}
                    footer={[
                        <Button key="cancel" onClick={() => {
                            setShowModal(false);
                            setSelectedApp(null);
                            setSelectedAccount("");
                        }}>
                            Cancel
                        </Button>,
                        <Button 
                            key="install" 
                            type="primary"
                            onClick={handleInstallApp}
                            disabled={!selectedAccount}
                        >
                            Install
                        </Button>
                    ]}
                >
                    <div style={{ marginBottom: '16px' }}>
                        <p>Select the account to install this app for:</p>
                        <Select
                            style={{ width: '100%' }}
                            value={selectedAccount}
                            onChange={setSelectedAccount}
                            placeholder="Choose an account..."
                        >
                            {accounts.map((account) => (
                                <Option key={account.id} value={account.id}>
                                    {account.name}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </Modal>
            </div>
        </App>
    );
};

export default AppsPage; 
