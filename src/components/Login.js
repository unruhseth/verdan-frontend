import React from 'react';
import { Form, Input, Button, Alert, Card, Checkbox } from 'antd';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
    const { handleLogin, error, isLoading } = useAuth();
    const [form] = Form.useForm();

    const onFinish = (values) => {
        // Clear any previous field errors
        form.setFields([
            { name: 'email', errors: [] },
            { name: 'password', errors: [] }
        ]);
        
        // Let handleLogin handle the error display
        handleLogin(values.email, values.password, values.remember_me);
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
                        message={error}
                        type="error"
                        showIcon
                        style={{
                            marginBottom: '1.5rem',
                            backgroundColor: '#fff2f0',
                            border: '1px solid #ffccc7',
                            borderRadius: '4px'
                        }}
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

                    <Form.Item
                        name="remember_me"
                        valuePropName="checked"
                        style={{ marginBottom: '24px' }}
                    >
                        <a className="login-form-forgot" href="#">
                            Forgot password
                        </a>
                        <Checkbox>Remember me</Checkbox>
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
