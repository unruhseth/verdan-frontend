import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePermissions } from '../../../hooks/usePermissions';
import './app-template.css';

const AppTemplate = () => {
    const { accountId } = useParams();
    const navigate = useNavigate();
    const { isAdmin, hasAccountAccess } = usePermissions();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchData();
    }, [accountId]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            if (!hasAccountAccess()) {
                navigate('/login');
                return;
            }

            const response = await fetch(`http://localhost:5000/your_app/data?account_id=${accountId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch data: ${response.status}`);
            }

            const responseData = await response.json();
            setData(responseData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error.message || 'Failed to load data');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="app-template">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app-template">
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={fetchData} className="btn retry">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="app-template">
            <div className="page-header">
                <h2>Your App Name</h2>
                <div className="header-actions">
                    {/* Add your action buttons here */}
                    <button className="btn primary">Action</button>
                </div>
            </div>

            <div className="main-content">
                {/* Add your main content here */}
                <p>Your app content goes here</p>
            </div>
        </div>
    );
};

export default AppTemplate; 