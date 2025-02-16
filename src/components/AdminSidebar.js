import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Button, theme, Drawer } from "antd";
import { 
    DashboardOutlined, 
    TeamOutlined, 
    AppstoreOutlined,
    SettingOutlined,
    LogoutOutlined,
    MenuOutlined
} from '@ant-design/icons';
import { useAuth } from "../hooks/useAuth";
import { sidebarStyles } from "../theme";

const { Sider } = Layout;

const AdminSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const { token } = theme.useToken();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [drawerVisible, setDrawerVisible] = useState(false);
    
    // Get current theme mode from localStorage or default to light
    const isDarkMode = localStorage.getItem('theme') === 'dark';

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuItems = [
        {
            key: '/admin',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/admin/accounts',
            icon: <TeamOutlined />,
            label: 'Accounts',
        },
        {
            key: '/admin/apps',
            icon: <AppstoreOutlined />,
            label: 'Apps',
        },
        {
            key: '/admin/settings',
            icon: <SettingOutlined />,
            label: 'Settings',
        }
    ];

    const handleMenuClick = (e) => {
        navigate(e.key);
        if (isMobile) {
            setDrawerVisible(false);
        }
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
    
    const sidebarContent = (
        <>
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
                    Admin Panel
                </h2>
            </div>

            <Menu
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
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
        </>
    );

    // Mobile hamburger menu button
    const mobileMenuButton = isMobile && (
        <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerVisible(true)}
            style={{
                position: 'fixed',
                top: '16px',
                left: '16px',
                zIndex: 1000,
                background: token.colorBgContainer,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
        />
    );

    return (
        <>
            {mobileMenuButton}
            
            {isMobile ? (
                <Drawer
                    placement="left"
                    onClose={() => setDrawerVisible(false)}
                    open={drawerVisible}
                    width={250}
                    bodyStyle={{
                        padding: 0,
                        height: '100%',
                        ...currentStyles
                    }}
                    contentWrapperStyle={{
                        ...currentStyles
                    }}
                >
                    {sidebarContent}
                </Drawer>
            ) : (
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
                    {sidebarContent}
                </Sider>
            )}
        </>
    );
};

export default AdminSidebar;

