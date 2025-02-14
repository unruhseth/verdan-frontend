import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AccountDetailsMenu from "../components/AccountDetailsMenu";

const AccountUsersPage = () => {
    const { accountId } = useParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newUser, setNewUser] = useState({ name: "", email: "", phone_number: "", password: "", role: "user" });
    const [editUser, setEditUser] = useState(null);
    const [activeForm, setActiveForm] = useState(null); // 'create', 'edit', or 'delete'

    useEffect(() => {
        fetchUsers();
    }, [accountId]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found.");

            const response = await fetch(`https://verdan-api.onrender.com/admin/accounts/${accountId}/users`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            });

            if (!response.ok) throw new Error("Failed to fetch users");

            const data = await response.json();
            setUsers(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching users:", error);
            setError("Failed to load users.");
            setLoading(false);
        }
    };

    const handleFormToggle = (formType) => {
        if (activeForm === formType) {
            setActiveForm(null);
        } else {
            setActiveForm(formType);
            setEditUser(null);
        }
    };

    const handleCreateUser = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found.");

            const response = await fetch(`https://verdan-api.onrender.com/admin/accounts/${accountId}/users`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) throw new Error("Failed to create user");

            setNewUser({ name: "", email: "", phone_number: "", password: "", role: "user" });
            setActiveForm(null);
            fetchUsers();
        } catch (error) {
            console.error("Error creating user:", error);
            setError("Failed to create user.");
        }
    };

    const handleEditUser = async () => {
        try {
            if (!editUser) return;

            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found.");

            const response = await fetch(`https://verdan-api.onrender.com/accounts/${accountId}/users/${editUser.id}`, {
                method: "PUT",
                headers: { 
                    "Authorization": `Bearer ${token}`, 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({
                    name: editUser.name,
                    email: editUser.email,
                    phone_number: editUser.phone_number,
                    role: editUser.role
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to update user: ${response.status}`);
            }

            setEditUser(null);
            setActiveForm(null);
            fetchUsers();
        } catch (error) {
            console.error("Error updating user:", error);
            setError(error.message || "Failed to update user");
        }
    };

    const handleResetPassword = async () => {
      try {
          if (!editUser) return;
  
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No authentication token found.");
  
          const response = await fetch(`https://verdan-api.onrender.com/admin/users/${editUser.id}/reset_password`, {
              method: "PUT",
              headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({ new_password: editUser.new_password }),
          });
  
          if (!response.ok) throw new Error("Failed to reset password");
  
          alert("Password reset successfully!");
          setEditUser({ ...editUser, new_password: "" }); // Clear password field
      } catch (error) {
          console.error("Error resetting password:", error);
          setError("Failed to reset password.");
      }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
    
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found.");
    
            const response = await fetch(`https://verdan-api.onrender.com/admin/users/${userId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });
    
            if (!response.ok) throw new Error("Failed to delete user");
    
            setActiveForm(null); // Close the delete form after successful deletion
            setEditUser(null);
            fetchUsers(); // Refresh user list
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user.");
        }
    };
  
  

    const handleUserSelect = (userId) => {
        const selectedUser = users.find(user => user.id === parseInt(userId));
        if (selectedUser) {
            setEditUser(selectedUser);
        }
    };

    return (
        <div className="admin-container">
            <AdminSidebar />
            <main className="content">
                <AccountDetailsMenu />
                <h2>Users</h2>

                {/* Buttons for Adding & Editing Users */}
                <div className="btn-group">
                    <button 
                        className={`btn ${activeForm === 'create' ? 'active' : ''}`} 
                        onClick={() => handleFormToggle('create')}
                    >
                        {activeForm === 'create' ? "Cancel" : "Add User"}
                    </button>
                    <button 
                        className={`btn ${activeForm === 'edit' ? 'active' : ''}`} 
                        onClick={() => handleFormToggle('edit')}
                    >
                        {activeForm === 'edit' ? "Cancel" : "Edit User"}
                    </button>
                    <div className="delete-container">
                        <button 
                            className={`btn delete ${activeForm === 'delete' ? 'active' : ''}`} 
                            onClick={() => handleFormToggle('delete')}
                        >
                            {activeForm === 'delete' ? "Cancel" : "Delete User"}
                        </button>
                        {activeForm === 'delete' && (
                            <div className="delete-form">
                                <select onChange={(e) => handleUserSelect(Number(e.target.value))}>
                                    <option value="">Select User to Delete</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name || "Unnamed User"}</option>
                                    ))}
                                </select>
                                <button 
                                    onClick={() => editUser && handleDeleteUser(editUser.id)} 
                                    className="btn delete"
                                    disabled={!editUser}
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create User Form */}
                {activeForm === 'create' && (
                    <div className="form">
                        <h3>Create User</h3>
                        <input type="text" placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                        <input type="email" placeholder="Email (Optional)" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                        <input type="text" placeholder="Phone Number (Optional)" value={newUser.phone_number} onChange={(e) => setNewUser({ ...newUser, phone_number: e.target.value })} />
                        <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                        <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                            <option value="user">User</option>
                            <option value="account_admin">Account Admin</option>
                            <option value="master_admin">Master Admin</option>
                        </select>
                        <button onClick={handleCreateUser} className="btn success">Create User</button>
                    </div>
                )}

                {/* Edit User Form */}
                {activeForm === 'edit' && (
                    <div className="form">
                        <h3>Edit User</h3>
                        <select onChange={(e) => handleUserSelect(Number(e.target.value))}>
                            <option value="">Select User</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name || "Unnamed User"}</option>
                            ))}
                        </select>
                        {editUser && (
                            <>
                                <input type="text" placeholder="Name" value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} />
                                <input type="email" placeholder="Email (Optional)" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} />
                                <input type="text" placeholder="Phone Number (Optional)" value={editUser.phone_number} onChange={(e) => setEditUser({ ...editUser, phone_number: e.target.value })} />
                                <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}>
                                    <option value="user">User</option>
                                    <option value="account_admin">Account Admin</option>
                                    <option value="master_admin">Master Admin</option>
                                </select>

                                {/* New Password Input */}
                                <input type="password" placeholder="New Password" value={editUser.new_password || ""} onChange={(e) => setEditUser({ ...editUser, new_password: e.target.value })} />

                                {/* Reset Password Button */}
                                <button onClick={handleResetPassword} className="btn secondary">Reset Password</button>

                                <button onClick={handleEditUser} className="btn success">Save Changes</button>
                            </>
                        )}
                    </div>
                )}

                {loading ? <p>Loading users...</p> : error ? <p className="error-message">{error}</p> : (
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone Number</th>
                                <th>Role</th>
                                <th>Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.name || "N/A"}</td>
                                        <td>{user.email || "N/A"}</td>
                                        <td>{user.phone_number || "N/A"}</td>
                                        <td>{user.role}</td>
                                        <td>{user.created_at ? new Date(user.created_at).toLocaleString() : "N/A"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6">No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </main>
        </div>
    );
};

export default AccountUsersPage;
