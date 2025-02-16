import React, { useState, useEffect } from 'react';
import { Card, Switch, Typography, Space, Divider } from 'antd';
import { BulbOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SettingsPage = () => {
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');

    const handleThemeChange = (checked) => {
        const theme = checked ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        setIsDarkMode(checked);
        
        // Trigger theme change in the app
        window.dispatchEvent(new Event('themeChange'));
    };

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Settings</Title>
            
            <Card style={{ maxWidth: 600, marginTop: '24px' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                    }}>
                        <Space>
                            <BulbOutlined style={{ fontSize: '20px' }} />
                            <Text strong>Dark Mode</Text>
                        </Space>
                        <Switch 
                            checked={isDarkMode}
                            onChange={handleThemeChange}
                        />
                    </div>
                    <Text type="secondary">
                        Toggle between light and dark theme
                    </Text>
                </Space>

                <Divider />

                {/* Add more settings here */}
            </Card>
        </div>
    );
};

export default SettingsPage; 