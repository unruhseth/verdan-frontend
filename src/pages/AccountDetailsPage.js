import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin, Alert, Tabs } from 'antd';
import AccountDetailsMenu from "../components/AccountDetailsMenu";
import { useAuth } from "../hooks/useAuth";
import { usePermissions } from "../hooks/usePermissions";
import { accountApi } from "../utils/api";

const AccountDetailsPage = () => {
    const { accountId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { isAdmin, isLoading: permissionsLoading } = usePermissions();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accountDetails, setAccountDetails] = useState(null);

    console.log('AccountDetailsPage render:', {
        accountId,
        isAuthenticated,
        authLoading,
        permissionsLoading,
        loading,
        error,
        hasDetails: !!accountDetails,
        token: localStorage.getItem('token'),
        role: localStorage.getItem('role')
    });

    // Fetch account details
    useEffect(() => {
        const fetchData = async () => {
            console.log('fetchData called:', {
                authLoading,
                permissionsLoading,
                isAuthenticated,
                isAdmin: isAdmin(),
                accountId
            });

            // Don't fetch if still loading auth or permissions
            if (authLoading || permissionsLoading) {
                console.log('Still loading auth or permissions');
                return;
            }

            // Don't fetch if not authenticated or not admin
            if (!isAuthenticated) {
                console.log('Not authenticated, skipping fetch');
                return;
            }

            if (!isAdmin()) {
                console.log('Not admin, skipping fetch');
                return;
            }

            try {
                console.log('Starting account details fetch for ID:', accountId);
                setLoading(true);
                const response = await accountApi.getAccountDetails(accountId);
                console.log('Account details fetched:', response.data);
                setAccountDetails(response.data);
                setError(null);
            } catch (error) {
                console.error('Error fetching account details:', error);
                setError('Failed to load account details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [accountId, isAuthenticated, isAdmin, authLoading, permissionsLoading]);

    // Show loading state while any dependencies are loading
    if (authLoading || permissionsLoading || loading) {
        console.log('Showing loading state:', {
            authLoading,
            permissionsLoading,
            loading
        });
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    // Show error if not admin (RequireAuth handles not authenticated case)
    if (!isAdmin()) {
        console.log('Access denied - not admin');
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

    // Show error if data fetch failed
    if (error) {
        console.log('Showing error:', error);
        return (
            <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
                style={{ margin: '24px' }}
            />
        );
    }

    console.log('Rendering account details:', accountDetails);

    return (
        <div style={{ padding: '24px' }}>
            {isAdmin() && <AccountDetailsMenu />}
            
            <Card title={`Account: ${accountDetails?.name || 'Loading...'}`}>
                <div style={{ marginBottom: '24px' }}>
                    <p><strong>ID:</strong> {accountDetails?.id}</p>
                    <p><strong>Subdomain:</strong> {accountDetails?.subdomain}</p>
                    <p><strong>Created:</strong> {accountDetails?.created_at ? new Date(accountDetails.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>

                <Tabs
                    defaultActiveKey="overview"
                    items={[
                        {
                            key: 'overview',
                            label: 'Overview',
                            children: (
                                <div>
                                    <h3>Account Overview</h3>
                                    {/* Add overview content */}
                                </div>
                            ),
                        },
                        {
                            key: 'users',
                            label: 'Users',
                            children: (
                                <div>
                                    <h3>Account Users</h3>
                                    {/* Add users list */}
                                </div>
                            ),
                        },
                        {
                            key: 'apps',
                            label: 'Apps',
                            children: (
                                <div>
                                    <h3>Installed Apps</h3>
                                    {/* Add apps list */}
                                </div>
                            ),
                        },
                    ]}
                />
            </Card>
        </div>
    );
};

export default AccountDetailsPage;
