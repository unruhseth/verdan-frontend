import React from 'react';
import { Form, Input, Button, Alert, Card } from 'antd';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
    const { handleLogin, error, isLoading } = useAuth();
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        try {
            await handleLogin(values);
        } catch (err) {
            console.log('Login form submission error:', err.message);
            
            // Handle specific error cases
            if (err.status === 401) {
                form.setFields([
                    {
                        name: 'email',
                        errors: ['User not found. Please check your email address.']
                    },
                    {
                        name: 'password',
                        errors: []
                    }
                ]);
            } else if (err.message.includes('password')) {
                form.setFields([
                    {
                        name: 'email',
                        errors: []
                    },
                    {
                        name: 'password',
                        errors: ['Incorrect password']
                    }
                ]);
            } else {
                form.setFields([
                    {
                        name: 'email',
                        errors: []
                    },
                    {
                        name: 'password',
                        errors: [err.message || 'Login failed']
                    }
                ]);
            }
        }
    };

    return (
        <div style={{ 
            maxWidth: 400, 
            margin: '40px auto', 
            padding: '0 20px'
        }}>
            <Card>
                <h1 style={{ 
                    textAlign: 'center', 
                    marginBottom: '2rem',
                    fontSize: '24px',
                    color: '#1890ff'
                }}>
                    Welcome Back
                </h1>
                
                {error && (
                    <Alert
                        message="Login Failed"
                        description={error}
                        type="error"
                        showIcon
                        closable
                        style={{ marginBottom: '1rem' }}
                    />
                )}

                <Form
                    form={form}
                    name="login"
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                    requiredMark={false}
                >
                    <Form.Item
                        label="Email"
                        name="email"
                        validateTrigger="onBlur"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email address!' }
                        ]}
                        help="Make sure to enter the exact email address used during registration"
                    >
                        <Input 
                            size="large" 
                            placeholder="Enter your email"
                            disabled={isLoading}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        validateTrigger="onBlur"
                        rules={[
                            { required: true, message: 'Please input your password!' },
                            { min: 6, message: 'Password must be at least 6 characters!' }
                        ]}
                    >
                        <Input.Password 
                            size="large" 
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
                    </Form.Item>

                    <Form.Item>
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

export default Login;
