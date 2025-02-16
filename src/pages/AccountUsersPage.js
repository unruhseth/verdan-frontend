import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table, Button, message, Spin, Space, Modal, Form, Input, Select, Alert } from 'antd';
import AccountDetailsMenu from "../components/AccountDetailsMenu";
import { usePermissions } from "../hooks/usePermissions";
import { accountApi } from "../utils/api";
import { tableStyles } from '../theme';

const { Option } = Select;

const AccountUsersPage = () => {
    const { accountId } = useParams();
    const { isAdmin } = usePermissions();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteForm, setShowDeleteForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchUsers();
    }, [accountId]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await accountApi.getAccountUsers(accountId);
            setUsers(response.data);
            setError("");
        } catch (error) {
            console.error("Error fetching users:", error);
            setError("Failed to load users.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (values) => {
        try {
            await accountApi.createAccountUser(accountId, values);
            message.success('User created successfully');
            setShowCreateForm(false);
            form.resetFields();
            fetchUsers();
        } catch (error) {
            console.error("Error creating user:", error);
            message.error(error.response?.data?.error || "Failed to create user");
        }
    };

    const handleEditUser = async (values) => {
        try {
            await accountApi.updateAccountUser(accountId, selectedUser.id, values);
            message.success('User updated successfully');
            setShowEditForm(false);
            setSelectedUser(null);
            form.resetFields();
            fetchUsers();
        } catch (error) {
            console.error("Error updating user:", error);
            message.error(error.response?.data?.error || "Failed to update user");
        }
    };

    const handleResetPassword = async (values) => {
        try {
            await accountApi.resetUserPassword(accountId, selectedUser.id, {
                new_password: values.password
            });
            message.success('Password reset successfully');
            form.setFieldValue('password', '');
        } catch (error) {
            console.error("Error resetting password:", error);
            message.error("Failed to reset password");
        }
    };

    const handleDeleteUser = async () => {
        try {
            await accountApi.deleteAccountUser(accountId, selectedUser.id);
            message.success('User deleted successfully');
            setShowDeleteForm(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
            message.error("Failed to delete user");
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
            width: 180,
            sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 220,
            sorter: (a, b) => (a.email || '').localeCompare(b.email || ''),
        },
        {
            title: 'Phone Number',
            dataIndex: 'phone_number',
            key: 'phone_number',
            width: 150,
            responsive: ['lg'],
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            width: 150,
            sorter: (a, b) => a.role.localeCompare(b.role),
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
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
                        onClick={() => {
                            setSelectedUser(record);
                            setShowEditForm(true);
                            form.setFieldsValue(record);
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        danger
                        onClick={() => {
                            setSelectedUser(record);
                            setShowDeleteForm(true);
                        }}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    const CreateUserForm = (
        <Modal
            title="Create New User"
            open={showCreateForm}
            onCancel={() => {
                setShowCreateForm(false);
                form.resetFields();
            }}
            footer={null}
        >
            <Form form={form} onFinish={handleCreateUser} layout="vertical">
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: 'Please enter user name' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { type: 'email', message: 'Please enter a valid email' }
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="phone_number"
                    label="Phone Number"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: true, message: 'Please enter password' }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item
                    name="role"
                    label="Role"
                    initialValue="user"
                >
                    <Select>
                        <Option value="user">User</Option>
                        <Option value="account_admin">Account Admin</Option>
                        <Option value="master_admin">Master Admin</Option>
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            Create User
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

    const EditUserForm = (
        <Modal
            title="Edit User"
            open={showEditForm}
            onCancel={() => {
                setShowEditForm(false);
                setSelectedUser(null);
                form.resetFields();
            }}
            footer={null}
        >
            {selectedUser && (
                <Form form={form} onFinish={handleEditUser} layout="vertical" initialValues={selectedUser}>
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please enter user name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="phone_number"
                        label="Phone Number"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="Role"
                    >
                        <Select>
                            <Option value="user">User</Option>
                            <Option value="account_admin">Account Admin</Option>
                            <Option value="master_admin">Master Admin</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="New Password (leave blank to keep current)"
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Save Changes
                            </Button>
                            {form.getFieldValue('password') && (
                                <Button onClick={() => handleResetPassword(form.getFieldsValue())}>
                                    Reset Password
                                </Button>
                            )}
                            <Button onClick={() => {
                                setShowEditForm(false);
                                setSelectedUser(null);
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

    const DeleteUserForm = (
        <Modal
            title="Delete User"
            open={showDeleteForm}
            onCancel={() => {
                setShowDeleteForm(false);
                setSelectedUser(null);
            }}
            footer={null}
        >
            {selectedUser && (
                <div style={{ textAlign: 'center' }}>
                    <p>Are you sure you want to delete {selectedUser.name || 'this user'}?</p>
                    <p>This action cannot be undone.</p>
                    <Space>
                        <Button danger type="primary" onClick={handleDeleteUser}>
                            Confirm Delete
                        </Button>
                        <Button onClick={() => {
                            setShowDeleteForm(false);
                            setSelectedUser(null);
                        }}>
                            Cancel
                        </Button>
                    </Space>
                </div>
            )}
        </Modal>
    );

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            {isAdmin() && <AccountDetailsMenu />}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '16px' 
            }}>
                <h1>Users Management</h1>
                <Button 
                    type="primary"
                    onClick={() => setShowCreateForm(true)}
                >
                    Create New User
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
                    dataSource={users}
                    rowKey="id"
                    loading={loading}
                />
            </div>
            {CreateUserForm}
            {EditUserForm}
            {DeleteUserForm}
        </div>
    );
};

export default AccountUsersPage;
