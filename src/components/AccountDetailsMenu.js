import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Menu, Typography, Spin, Alert, theme, Button, Drawer } from 'antd';
import {
    AppstoreOutlined,
    TeamOutlined,
    DashboardOutlined,
    ShoppingOutlined,
    MobileOutlined,
    CreditCardOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined
} from '@ant-design/icons';
import { accountApi } from "../utils/api";

const { Title } = Typography;

const AccountDetailsMenu = () => {
    const { accountId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { token } = theme.useToken();
    const baseUrl = `/admin/accounts/${accountId}`;
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);

    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) {
                setDrawerVisible(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                setLoading(true);
                const response = await accountApi.getAccountDetails(accountId);
                setAccount(response.data);
                setError("");
            } catch (error) {
                console.error("Error fetching account details:", error);
                setError("Failed to load account.");
            } finally {
                setLoading(false);
            }
        };

        fetchAccount();
    }, [accountId]);

    const menuItems = [
        {
            key: `${baseUrl}`,
            icon: <DashboardOutlined />,
            label: 'Overview'
        },
        {
            key: `${baseUrl}/users`,
            icon: <TeamOutlined />,
            label: 'Users'
        },
        {
            key: `${baseUrl}/apps`,
            icon: <AppstoreOutlined />,
            label: 'Apps'
        },
        {
            key: `${baseUrl}/subscriptions`,
            icon: <ShoppingOutlined />,
            label: 'Subscriptions'
        },
        {
            key: `${baseUrl}/devices`,
            icon: <MobileOutlined />,
            label: 'Devices'
        },
        {
            key: `${baseUrl}/sim-cards`,
            icon: <CreditCardOutlined />,
            label: 'SIM Cards'
        }
    ];

    if (loading) {
        return (
            <div style={{ padding: '16px', textAlign: 'center' }}>
                <Spin size="small" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message={error}
                type="error"
                showIcon
                style={{ margin: '16px' }}
            />
        );
    }

    const handleMenuClick = ({ key }) => {
        navigate(key);
        if (isMobile) {
            setDrawerVisible(false);
        }
    };

    const menuContent = (
        <>
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '0 16px',
                marginBottom: '16px'
            }}>
                <Title 
                    level={4} 
                    style={{ 
                        margin: 0,
                        color: token.colorText
                    }}
                >
                    {account?.name}
                </Title>
                {!isMobile && (
                    <Button
                        type="text"
                        icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    />
                )}
            </div>
            
            <Menu
                mode={isMobile ? "vertical" : "horizontal"}
                selectedKeys={[location.pathname]}
                items={menuItems}
                style={{
                    background: 'transparent',
                    borderBottom: `1px solid ${token.colorBorder}`
                }}
                onClick={handleMenuClick}
                theme={localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'}
            />
        </>
    );

    // Mobile toggle button
    const mobileToggle = isMobile && (
        <Button
            type="text"
            icon={<MenuFoldOutlined />}
            onClick={() => setDrawerVisible(true)}
            style={{
                marginRight: '8px'
            }}
        />
    );

    return (
        <div style={{ marginBottom: '24px' }}>
            {isMobile ? (
                <>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        padding: '0 16px',
                        marginBottom: '16px'
                    }}>
                        {mobileToggle}
                        <Title 
                            level={4} 
                            style={{ 
                                margin: 0,
                                color: token.colorText
                            }}
                        >
                            {account?.name}
                        </Title>
                    </div>
                    <Drawer
                        title={account?.name}
                        placement="top"
                        onClose={() => setDrawerVisible(false)}
                        open={drawerVisible}
                        height="auto"
                        bodyStyle={{ padding: 0 }}
                    >
                        <Menu
                            mode="vertical"
                            selectedKeys={[location.pathname]}
                            items={menuItems}
                            onClick={handleMenuClick}
                            style={{ border: 'none' }}
                            theme={localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'}
                        />
                    </Drawer>
                </>
            ) : (
                menuContent
            )}
        </div>
    );
};

export default AccountDetailsMenu;
