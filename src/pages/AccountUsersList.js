import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AccountSidebar from "../components/AccountSidebar";
import AdminSidebar from "../components/AdminSidebar";
import { usePermissions } from "../hooks/usePermissions";

const AccountUsersList = () => {
    const { accountId } = useParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeForm, setActiveForm] = useState(null); // 'add', 'edit', or 'delete'
    const [selectedUser, setSelectedUser] = useState(null);
    const { isAdmin, canManageUsers, userRole } = usePermissions();
    
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        phone_number: "",
        password: "",
        role: "user"
    });

    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [newPassword, setNewPassword] = useState("");

    useEffect(() => {
        fetchUsers();
    }, [accountId]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found.");

            const response = await fetch(`http://localhost:5000/accounts/${accountId}/users`, {
                method: "GET",
                headers: { 
                    "Authorization": `Bearer ${token}`, 
                    "Content-Type": "application/json" 
                },
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error("You don't have permission to view users");
                }
                throw new Error("Failed to fetch users");
            }

            const data = await response.json();
            setUsers(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching users:", error);
            setError(error.message);
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found.");

            const response = await fetch(`http://localhost:5000/accounts/${accountId}/users`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newUser)
            });

            if (!response.ok) throw new Error("Failed to create user");

            setActiveForm(null);
            setNewUser({ name: "", email: "", phone_number: "", password: "", role: "user" });
            fetchUsers();
        } catch (error) {
            console.error("Error creating user:", error);
            setError("Failed to create user");
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found.");

            const response = await fetch(`http://localhost:5000/accounts/${accountId}/users/${selectedUser.id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(selectedUser)
            });

            if (!response.ok) throw new Error("Failed to update user");

            setActiveForm(null);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            console.error("Error updating user:", error);
            setError("Failed to update user");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found.");

            const response = await fetch(`http://localhost:5000/accounts/${accountId}/users/${userId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Failed to delete user");

            setActiveForm(null);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
            setError("Failed to delete user");
        }
    };

    const handleResetPassword = async (userId, newPassword) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found.");

            const response = await fetch(`http://localhost:5000/accounts/${accountId}/users/${userId}/reset-password`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ password: newPassword })
            });

            if (!response.ok) throw new Error("Failed to reset password");

            setShowPasswordReset(false);
            setNewPassword("");
            alert("Password reset successfully");
        } catch (error) {
            console.error("Error resetting password:", error);
            setError("Failed to reset password");
        }
    };

    const Sidebar = isAdmin() ? AdminSidebar : AccountSidebar;

    const handleFormToggle = (formType) => {
        if (activeForm === formType) {
            setActiveForm(null);
            setSelectedUser(null);
        } else {
            setActiveForm(formType);
            setSelectedUser(null);
        }
    };

    const PasswordResetModal = () => {
        if (!showPasswordReset) return null;

        return (
            <div className="password-reset-modal">
                <div className="password-reset-content">
                    <div className="password-reset-header">
                        <h3>Reset Password</h3>
                    </div>
                    <form className="password-reset-form" onSubmit={(e) => {
                        e.preventDefault();
                        handleResetPassword(selectedUser.id, newPassword);
                    }}>
                        <div className="password-input-group">
                            <input
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        <div className="password-reset-actions">
                            <button
                                type="button"
                                className="btn secondary"
                                onClick={() => {
                                    setShowPasswordReset(false);
                                    setNewPassword("");
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn"
                                disabled={!newPassword}
                            >
                                Reset Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="admin-container">
                <Sidebar />
                <main className="content">
                    <h2>Users</h2>
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading users...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <Sidebar />
            <main className="content">
                <h2>Users</h2>
                
                {/* Action Buttons - Only shown to admins and account admins */}
                {canManageUsers() && (
                    <div className="btn-group">
                        <button 
                            className={`btn ${activeForm === 'add' ? 'active' : ''}`}
                            onClick={() => handleFormToggle('add')}
                        >
                            {activeForm === 'add' ? 'Cancel' : 'Add User'}
                        </button>
                        <button 
                            className={`btn ${activeForm === 'edit' ? 'active' : ''}`}
                            onClick={() => handleFormToggle('edit')}
                        >
                            {activeForm === 'edit' ? 'Cancel' : 'Edit User'}
                        </button>
                        {canManageUsers() && (
                            <button 
                                className={`btn delete ${activeForm === 'delete' ? 'active' : ''}`}
                                onClick={() => handleFormToggle('delete')}
                            >
                                {activeForm === 'delete' ? 'Cancel' : 'Delete User'}
                            </button>
                        )}
                    </div>
                )}

                {error && <p className="error-message">{error}</p>}

                {/* Add User Form */}
                {activeForm === 'add' && (
                    <div className="form">
                        <h3>Add New User</h3>
                        <form onSubmit={handleAddUser}>
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="Phone Number"
                                    value={newUser.phone_number}
                                    onChange={(e) => setNewUser({ ...newUser, phone_number: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="user">User</option>
                                    {(isAdmin() || userRole === 'account_admin') && (
                                        <option value="account_admin">Account Admin</option>
                                    )}
                                </select>
                            </div>
                            <button type="submit" className="btn success">Add User</button>
                        </form>
                    </div>
                )}

                {/* Edit User Form */}
                {activeForm === 'edit' && (
                    <div className="form">
                        <h3>Edit User</h3>
                        <div className="form-group">
                            <select
                                onChange={(e) => {
                                    const user = users.find(u => u.id === parseInt(e.target.value));
                                    setSelectedUser(user);
                                }}
                                value={selectedUser?.id || ""}
                            >
                                <option value="">Select User</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name || user.email || "Unnamed User"}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {selectedUser && (
                            <form onSubmit={handleEditUser}>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={selectedUser.name || ""}
                                        onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={selectedUser.email || ""}
                                        onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        placeholder="Phone Number"
                                        value={selectedUser.phone_number || ""}
                                        onChange={(e) => setSelectedUser({ ...selectedUser, phone_number: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <select
                                        value={selectedUser.role}
                                        onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                                    >
                                        <option value="user">User</option>
                                        {(isAdmin() || userRole === 'account_admin') && (
                                            <option value="account_admin">Account Admin</option>
                                        )}
                                    </select>
                                </div>
                                <div className="form-buttons">
                                    <button type="submit" className="btn success">Save Changes</button>
                                    <button
                                        type="button"
                                        className="btn secondary"
                                        onClick={() => setShowPasswordReset(true)}
                                    >
                                        Reset Password
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* Delete User Form */}
                {activeForm === 'delete' && (
                    <div className="form delete">
                        <h3>Delete User</h3>
                        <div className="form-group">
                            <select
                                onChange={(e) => {
                                    const user = users.find(u => u.id === parseInt(e.target.value));
                                    setSelectedUser(user);
                                }}
                                value={selectedUser?.id || ""}
                            >
                                <option value="">Select User to Delete</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name || user.email || "Unnamed User"}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button 
                            onClick={() => selectedUser && handleDeleteUser(selectedUser.id)}
                            className="btn delete"
                            disabled={!selectedUser}
                        >
                            Confirm Delete
                        </button>
                    </div>
                )}

                {/* Users Table */}
                <div className="users-list">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.name || "N/A"}</td>
                                        <td>{user.email || "N/A"}</td>
                                        <td>{user.role}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="no-data">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Password Reset Modal */}
            <PasswordResetModal />
        </div>
    );
};

export default AccountUsersList; 