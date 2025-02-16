import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Alert } from 'antd';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const [form] = Form.useForm();
  const { login, error: authError, isLoading, clearError } = useAuth();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Clear errors when component mounts or unmounts
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  const onFinish = async (values) => {
    try {
      setError(null);
      console.log('Starting login process with:', { email: values.email });
      
      // Call login function with email and password
      const response = await login(values.email, values.password);
      console.log('Login response received:', {
        hasUser: !!response.user,
        hasToken: !!response.access_token
      });
      
      // Verify we have user data
      if (!response.user) {
        throw new Error('Invalid response: missing user data');
      }

      // Store user info in sessionStorage
      const userInfo = {
        role: response.user.role,
        accountId: response.user.account_id,
        userId: response.user.id,
        email: response.user.email,
        name: response.user.name
      };

      console.log('Storing user info:', {
        role: userInfo.role,
        accountId: userInfo.accountId
      });

      sessionStorage.setItem('userInfo', JSON.stringify(userInfo));

      // Small delay to ensure storage is set
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify storage was set correctly
      const storedToken = sessionStorage.getItem('access_token');
      const storedUserInfo = sessionStorage.getItem('userInfo');
      
      console.log('Verifying stored data:', {
        hasToken: !!storedToken,
        hasUserInfo: !!storedUserInfo
      });

      if (!storedToken || !storedUserInfo) {
        throw new Error('Failed to store authentication data');
      }

      // Navigate based on role
      console.log('Navigating based on role:', userInfo.role);
      
      if (['master_admin', 'admin'].includes(userInfo.role)) {
        console.log('Navigating to admin dashboard');
        navigate('/admin/dashboard', { replace: true });
      } else if (userInfo.role === 'account_admin' || userInfo.role === 'user') {
        if (!userInfo.accountId && userInfo.accountId !== 0) {
          throw new Error('Invalid response: missing account ID');
        }
        console.log('Navigating to account dashboard:', userInfo.accountId);
        navigate(`/account/${userInfo.accountId}/dashboard`, { replace: true });
      } else {
        throw new Error(`Invalid user role: ${userInfo.role}`);
      }
    } catch (err) {
      console.error('Login error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Set appropriate error message
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMessage);
      
      // Clear password field
      form.setFieldsValue({ password: '' });
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '20px',
      background: '#f0f2f5'
    }}>
      <Card 
        title="Login" 
        style={{ 
          width: 400, 
          maxWidth: '100%',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}
      >
        {(error || authError) && (
          <Alert
            message={error || authError}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
            closable
            onClose={() => {
              setError(null);
              clearError();
            }}
          />
        )}
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="Email"
            validateTrigger="onBlur"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoading} 
              block
              size="large"
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
