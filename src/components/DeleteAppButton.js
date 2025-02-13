import React, { useState } from 'react';
import { usePermissions } from '../hooks/usePermissions';

const DeleteAppButton = ({ apps, onSuccess }) => {
    const [selectedApp, setSelectedApp] = useState(null);
    const [showDelete, setShowDelete] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { isAdmin } = usePermissions();

    if (!isAdmin()) return null;

    const handleDelete = async () => {
        if (!selectedApp || !window.confirm(`Are you sure you want to delete ${selectedApp.name}? This will remove all installations of this app from all accounts.`)) {
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found.");

            const response = await fetch(`http://localhost:5000/admin/apps/${selectedApp.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to delete app");
            }

            const data = await response.json();
            alert(data.message);
            setShowDelete(false);
            setSelectedApp(null);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error deleting app:", error);
            alert("Failed to delete app: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="delete-container">
            {!showDelete ? (
                <button 
                    className="btn delete"
                    onClick={() => setShowDelete(true)}
                    style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}
                >
                    Delete App
                </button>
            ) : (
                <div className="delete-form" style={{ marginTop: '10px', padding: '15px', border: '1px solid #dc3545', borderRadius: '4px', backgroundColor: '#fff' }}>
                    <button 
                        className="btn"
                        onClick={() => setShowDelete(false)}
                        style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', marginBottom: '10px' }}
                    >
                        Cancel
                    </button>
                    <select 
                        onChange={(e) => setSelectedApp(apps.find(app => app.id === Number(e.target.value)))}
                        value={selectedApp?.id || ""}
                        style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                    >
                        <option value="">Select App to Delete</option>
                        {apps.map(app => (
                            <option key={app.id} value={app.id}>
                                {app.name}
                            </option>
                        ))}
                    </select>
                    <button 
                        onClick={handleDelete} 
                        className="btn"
                        disabled={!selectedApp || isLoading}
                        style={{ 
                            backgroundColor: !selectedApp || isLoading ? '#ccc' : '#6c757d',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            width: '100%'
                        }}
                    >
                        {isLoading ? "Deleting..." : "Confirm Delete"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default DeleteAppButton; 