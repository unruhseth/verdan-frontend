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
    const [pageLoading, setPageLoading] = useState(false);
    const [installLoading, setInstallLoading] = useState(false);
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

    // Fetch initial data
    useEffect(() => {
        const loadInitialData = async () => {
            if (pageLoading || authLoading || permissionsLoading) {
                return;
            }

            if (!isAuthenticated) {
                navigate('/login');
                return;
            }

            if (!isAdmin()) {
                setError('You do not have permission to view this page');
                return;
            }

            try {
                setPageLoading(true);
                setError("");
                
                // Use Promise.all to fetch all data in parallel
                const [accountsResponse, appsResponse] = await Promise.all([
                    api.get('/accounts/'),
                    api.get('/admin/apps')
                ]);

                // Process apps data
                const appsWithPricing = appsResponse.data.map(app => ({
                    ...app,
                    icon_url: app.icon_url || defaultAppIcon,
                    monthly_price: app.monthly_price || 9.99,
                    yearly_price: app.yearly_price || 99.99
                }));

                setAccounts(accountsResponse.data);
                setAvailableApps(appsWithPricing);
            } catch (err) {
                console.error("Error loading data:", err);
                setError("Failed to load data. Please try again.");
                showMessage('error', "Failed to load data. Please try again later.");
            } finally {
                setPageLoading(false);
            }
        };

        if (isAuthenticated && !authLoading && !permissionsLoading) {
            loadInitialData();
        }
    }, [isAuthenticated, isAdmin, authLoading, permissionsLoading, navigate]);

    // Separate effect for fetching installed apps when account is selected
    useEffect(() => {
        const fetchInstalledApps = async () => {
            if (!selectedAccount) return;
            
            try {
                const response = await appManagementApi.listInstalledApps(selectedAccount);
                setInstalledApps(response.data || []);
            } catch (error) {
                console.error("Error fetching installed apps:", error);
                showMessage('warning', 'Unable to fetch installed apps. Installation checks may not be accurate.');
                setInstalledApps([]);
            }
        };

        fetchInstalledApps();
    }, [selectedAccount]);

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

        const isAlreadyInstalled = installedApps.some(app => 
            app.id === appId || 
            app.uuid === appId || 
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
            setInstallLoading(true);
            console.log('Installing app:', { accountId, appId, appName: selectedApp.name });
            
            const result = await appManagementApi.installApp(accountId, appId);
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to install app');
            }
            
            const successMessage = result.data?.message || `Successfully installed ${selectedApp.name}`;
            showMessage('success', successMessage);
            
            if (result.data?.warning) {
                setTimeout(() => {
                    showMessage('warning', result.data.warning);
                }, 100);
            }
            
            // Refresh installed apps without closing modal
            const installedResponse = await appManagementApi.listInstalledApps(accountId);
            setInstalledApps(installedResponse.data || []);
            
            // Only close modal after everything is done
            setShowModal(false);
            setSelectedApp(null);
            setSelectedAccount("");
            setInstallStatus({ message: "", type: "" });
        } catch (error) {
            console.error("Error installing app:", error);
            const errorMessage = error.message || "Failed to install app";
            showMessage('error', errorMessage);
        } finally {
            setInstallLoading(false);
        }
    };

    // Show loading state while auth or permissions are loading
    if (authLoading || permissionsLoading || pageLoading) {
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

    // Add function to handle app deletion
    const handleDeleteApp = async (app) => {
        try {
            setInstallLoading(true);
            await api.delete(`/admin/apps/${app.id}`);
            showMessage('success', `Successfully deleted ${app.name}`);
            
            // Refresh the available apps list using the existing API call
            const appsResponse = await api.get('/admin/apps');
            const appsWithPricing = appsResponse.data.map(app => ({
                ...app,
                icon_url: app.icon_url || defaultAppIcon,
                monthly_price: app.monthly_price || 9.99,
                yearly_price: app.yearly_price || 99.99
            }));
            setAvailableApps(appsWithPricing);
            
        } catch (err) {
            console.error("Error deleting app:", err);
            showMessage('error', `Failed to delete ${app.name}. Please try again later.`);
        } finally {
            setInstallLoading(false);
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
                            loading={installLoading}
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
