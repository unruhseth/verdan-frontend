import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, message, Spin, Space, Modal, Select, Form, Input, Alert } from 'antd';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { accountApi } from '../utils/api';
import { tableStyles } from '../theme';

const { Option } = Select;

const AccountsPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteForm, setShowDeleteForm] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading, userInfo } = useAuth();
    const { isAdmin, isLoading: permissionsLoading } = usePermissions();
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        if (authLoading || permissionsLoading) {
            return;
        }

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
            const response = await accountApi.getAccounts();
            setAccounts(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching accounts:', err);
            setError('Failed to fetch accounts');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, isAdmin, authLoading, permissionsLoading, navigate]);

    useEffect(() => {
        if (!authLoading && !permissionsLoading) {
            loadData();
        }
    }, [loadData, authLoading, permissionsLoading]);

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

    const handleCreateAccount = async (values) => {
        try {
            console.log('Creating account:', values);
            const response = await accountApi.createAccount({
                name: values.name,
                subdomain: values.subdomain
            });
            console.log('Account created:', response.data);
            message.success('Account created successfully');
            setShowCreateForm(false);
            form.resetFields();
            loadData();
        } catch (error) {
            console.error('Error creating account:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            message.error(error.response?.data?.error || 'Failed to create account');
            setError(error.response?.data?.error || 'Failed to create account');
        }
    };

    const handleEditAccount = async (values) => {
        try {
            console.log('Updating account:', { id: selectedAccount.id, values });
            const response = await accountApi.updateAccount(selectedAccount.id, {
                name: values.name,
                subdomain: values.subdomain
            });
            console.log('Account updated:', response.data);
            message.success('Account updated successfully');
            setShowEditForm(false);
            setSelectedAccount(null);
            form.resetFields();
            loadData();
        } catch (error) {
            console.error('Error updating account:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            message.error(error.response?.data?.error || 'Failed to update account');
            setError(error.response?.data?.error || 'Failed to update account');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            console.log('Deleting account:', selectedAccount.id);
            await accountApi.deleteAccount(selectedAccount.id);
            console.log('Account deleted successfully');
            message.success('Account deleted successfully');
            setShowDeleteForm(false);
            setSelectedAccount(null);
            loadData();
        } catch (error) {
            console.error('Error deleting account:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            message.error(error.response?.data?.error || 'Failed to delete account');
            setError(error.response?.data?.error || 'Failed to delete account');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text, record) => (
                <a onClick={() => navigate(`/admin/accounts/${record.id}`)}>{text}</a>
            ),
        },
        {
            title: 'Subdomain',
            dataIndex: 'subdomain',
            key: 'subdomain',
            width: 200,
            sorter: (a, b) => a.subdomain.localeCompare(b.subdomain),
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
            responsive: ['md'],
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAccount(record);
                            setShowEditForm(true);
                            form.setFieldsValue(record);
                        }}
                    >
                        Edit
                    </Button>
                    <Button 
                        danger
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAccount(record);
                            setShowDeleteForm(true);
                        }}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    const CreateAccountForm = (
        <Modal
            title="Create New Account"
            open={showCreateForm}
            onCancel={() => {
                setShowCreateForm(false);
                form.resetFields();
            }}
            footer={null}
        >
            <Form form={form} onFinish={handleCreateAccount} layout="vertical">
                <Form.Item 
                    name="name" 
                    label="Account Name" 
                    rules={[{ required: true, message: 'Please enter account name' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item 
                    name="subdomain" 
                    label="Subdomain" 
                    rules={[
                        { required: true, message: 'Please enter subdomain' },
                        { pattern: /^[a-z0-9-]+$/, message: 'Subdomain can only contain lowercase letters, numbers, and hyphens' }
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            Create Account
                        </Button>
                        <Button onClick={() => {
                            setShowCreateForm(false);
                            form.resetFields();
                        }}>
                            Cancel
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );

    const EditAccountForm = (
        <Modal
            title="Edit Account"
            open={showEditForm}
            onCancel={() => {
                setShowEditForm(false);
                setSelectedAccount(null);
                form.resetFields();
            }}
            footer={null}
        >
            {selectedAccount && (
                <Form form={form} onFinish={handleEditAccount} layout="vertical" initialValues={selectedAccount}>
                    <Form.Item 
                        name="name" 
                        label="Account Name" 
                        rules={[{ required: true, message: 'Please enter account name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item 
                        name="subdomain" 
                        label="Subdomain" 
                        rules={[
                            { required: true, message: 'Please enter subdomain' },
                            { pattern: /^[a-z0-9-]+$/, message: 'Subdomain can only contain lowercase letters, numbers, and hyphens' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Save Changes
                            </Button>
                            <Button onClick={() => {
                                setShowEditForm(false);
                                setSelectedAccount(null);
                                form.resetFields();
                            }}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            )}
        </Modal>
    );

    const DeleteAccountForm = (
        <Modal
            title="Delete Account"
            open={showDeleteForm}
            onCancel={() => {
                setShowDeleteForm(false);
                setSelectedAccount(null);
            }}
            footer={null}
        >
            {selectedAccount && (
                <div style={{ textAlign: 'center' }}>
                    <p>Are you sure you want to delete {selectedAccount.name}?</p>
                    <p>This action cannot be undone.</p>
                    <Space>
                        <Button danger type="primary" onClick={handleDeleteAccount}>
                            Confirm Delete
                        </Button>
                        <Button onClick={() => {
                            setShowDeleteForm(false);
                            setSelectedAccount(null);
                        }}>
                            Cancel
                        </Button>
                    </Space>
                </div>
            )}
        </Modal>
    );

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '16px' 
            }}>
                <h1>Accounts Management</h1>
                <Button 
                    type="primary"
                    onClick={() => setShowCreateForm(true)}
                >
                    Create New Account
                </Button>
            </div>
            
            {error && (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: '16px' }}
                />
            )}

            <div style={tableStyles}>
                <Table 
                    columns={columns} 
                    dataSource={accounts}
                    rowKey="id"
                    onRow={(record) => ({
                        onClick: () => navigate(`/admin/accounts/${record.id}`),
                        style: { 
                            cursor: 'pointer',
                            transition: 'background-color 0.3s',
                        },
                        onMouseEnter: (e) => {
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                        },
                        onMouseLeave: (e) => {
                            e.currentTarget.style.backgroundColor = '';
                        }
                    })}
                    loading={loading}
                />
            </div>
            {CreateAccountForm}
            {EditAccountForm}
            {DeleteAccountForm}
        </div>
    );
};

export default AccountsPage;
