import React from "react";
import { useParams, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Layout, Menu, Button, theme } from "antd";
import {
    DashboardOutlined,
    TeamOutlined,
    AppstoreOutlined,
    MobileOutlined,
    CreditCardOutlined,
    ShoppingOutlined,
    SettingOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { usePermissions } from "../hooks/usePermissions";
import { useAuth } from "../hooks/useAuth";
import { sidebarStyles } from "../theme";

const { Sider } = Layout;

const AccountSidebar = () => {
    const navigate = useNavigate();
    const { accountId } = useParams();
    const location = useLocation();
    const { userRole } = usePermissions();
    const { logout } = useAuth();
    const { token } = theme.useToken();

    // Get current theme mode from localStorage or default to light
    const isDarkMode = localStorage.getItem('theme') === 'dark';

    // Define menu items based on user role
    const getMenuItems = () => {
        const baseItems = [
            {
                key: `/account/${accountId}/dashboard`,
                icon: <DashboardOutlined />,
                label: 'Dashboard',
            },
            {
                key: `/account/${accountId}/users`,
                icon: <TeamOutlined />,
                label: 'Users',
            },
            {
                key: `/account/${accountId}/apps`,
                icon: <AppstoreOutlined />,
                label: 'Apps',
            },
            {
                key: `/account/${accountId}/devices`,
                icon: <MobileOutlined />,
                label: 'Devices',
            }
        ];

        // Add additional items for account admin
        if (userRole === 'account_admin') {
            baseItems.push(
                {
                    key: `/account/${accountId}/sim-cards`,
                    icon: <CreditCardOutlined />,
                    label: 'SIM Cards',
                },
                {
                    key: `/account/${accountId}/subscriptions`,
                    icon: <ShoppingOutlined />,
                    label: 'Subscriptions',
                },
                {
                    key: `/account/${accountId}/settings`,
                    icon: <SettingOutlined />,
                    label: 'Settings',
                }
            );
        }

        return baseItems;
    };

    const handleMenuClick = (e) => {
        navigate(e.key);
    };

    const handleLogout = async () => {
        try {
            await logout();
            // The logout function will handle the redirect
        } catch (error) {
            console.error('Error during logout:', error);
            // Force redirect to login even if there's an error
            window.location.href = '/login';
        }
    };

    const currentStyles = isDarkMode ? sidebarStyles.dark : sidebarStyles.light;

    return (
        <Sider
            width={250}
            style={{
                ...currentStyles,
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
            }}
        >
            <div style={{ 
                padding: '16px',
                textAlign: 'center',
                borderBottom: `1px solid ${token.colorBorder}`,
                marginBottom: '16px'
            }}>
                <h2 style={{ 
                    color: token.colorText,
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: 600
                }}>
                    Account Panel
                </h2>
            </div>

            <Menu
                mode="inline"
                selectedKeys={[location.pathname]}
                items={getMenuItems()}
                onClick={handleMenuClick}
                style={{
                    border: 'none',
                    background: 'transparent'
                }}
            />

            <div style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                padding: '16px',
                borderTop: `1px solid ${token.colorBorder}`,
            }}>
                <Button
                    type="text"
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    danger
                    style={{ width: '100%' }}
                >
                    Logout
                </Button>
            </div>
        </Sider>
    );
};

export default AccountSidebar;