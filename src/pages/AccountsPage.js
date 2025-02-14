import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import CreateAccountForm from "../components/CreateAccountForm";
import "../styles/accounts.css";

const AccountsPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteForm, setShowDeleteForm] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found.");

            const response = await fetch("https://verdan-api.onrender.com/admin/accounts", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Failed to fetch accounts");

            const data = await response.json();
            setAccounts(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching accounts:", error);
            setError("Failed to load accounts.");
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!selectedAccount) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found.");

            const response = await fetch(`https://verdan-api.onrender.com/accounts/${selectedAccount}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Failed to delete account");

            setShowDeleteForm(false);
            setSelectedAccount(null);
            fetchAccounts();
        } catch (error) {
            console.error("Error deleting account:", error);
            setError("Failed to delete account.");
        }
    };

    if (loading) {
        return (
            <div className="admin-container">
                <AdminSidebar />
                <main className="content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading accounts...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <AdminSidebar />
            <main className="content">
                <h1>Accounts</h1>
                
                <div className="action-buttons">
                    <button 
                        className="action-button"
                        onClick={() => {
                            setShowCreateForm(!showCreateForm);
                            setShowEditForm(false);
                            setShowDeleteForm(false);
                        }}
                    >
                        Add Account
                    </button>
                    <button 
                        className="action-button"
                        onClick={() => {
                            setShowEditForm(!showEditForm);
                            setShowCreateForm(false);
                            setShowDeleteForm(false);
                        }}
                    >
                        Edit Account
                    </button>
                    <button 
                        className="action-button delete"
                        onClick={() => {
                            setShowDeleteForm(!showDeleteForm);
                            setShowCreateForm(false);
                            setShowEditForm(false);
                        }}
                    >
                        Delete Account
                    </button>
                </div>

                {error && <p className="error-message">{error}</p>}

                {/* Create Account Form */}
                {showCreateForm && (
                    <div className="form-section">
                        <CreateAccountForm 
                            onCancel={() => setShowCreateForm(false)}
                        />
                    </div>
                )}

                {/* Edit Account Form */}
                {showEditForm && (
                    <div className="form-section">
                        <select
                            value={selectedAccount || ""}
                            onChange={(e) => setSelectedAccount(e.target.value)}
                            className="form-select"
                        >
                            <option value="">Select Account</option>
                            {accounts.map(account => (
                                <option key={account.id} value={account.id}>
                                    {account.name}
                                </option>
                            ))}
                        </select>
                        {/* Add edit form fields here */}
                    </div>
                )}

                {/* Delete Account Form */}
                {showDeleteForm && (
                    <div className="form-section delete">
                        <select
                            value={selectedAccount || ""}
                            onChange={(e) => setSelectedAccount(e.target.value)}
                            className="form-select"
                        >
                            <option value="">Select Account to Delete</option>
                            {accounts.map(account => (
                                <option key={account.id} value={account.id}>
                                    {account.name}
                                </option>
                            ))}
                        </select>
                        <button 
                            className="delete-button"
                            onClick={handleDeleteAccount}
                            disabled={!selectedAccount}
                        >
                            Confirm Delete
                        </button>
                    </div>
                )}

                {/* Accounts Table */}
                <div className="data-grid">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map((account) => (
                                <tr key={account.id}>
                                    <td>{account.id}</td>
                                    <td>
                                        <Link 
                                            to={`/admin/accounts/${account.id}`}
                                            className="name-link"
                                        >
                                            {account.name}
                                        </Link>
                                    </td>
                                    <td>
                                        {new Date(account.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default AccountsPage;
