import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../../styles/multi-control.css';

const MultiControlAlerts = () => {
    const { accountId } = useParams();
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newAlert, setNewAlert] = useState({
        name: '',
        type: 'warning',
        message: '',
        field_id: '',
        equipment_id: ''
    });
    const [fields, setFields] = useState([]);
    const [equipment, setEquipment] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchAlerts();
        fetchFields();
        fetchEquipment();
    }, [accountId]);

    const fetchAlerts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get(`http://localhost:5000/multi_controls/alerts/?account_id=${accountId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.data) {
                throw new Error('No data received from server');
            }

            setAlerts(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching alerts:', error);
            setError(error.message || 'Failed to load alerts');
            setLoading(false);
        }
    };

    const fetchFields = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get(`http://localhost:5000/multi_controls/fields/?account_id=${accountId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.data) {
                throw new Error('No data received from server');
            }

            setFields(response.data);
        } catch (error) {
            console.error('Error fetching fields:', error);
        }
    };

    const fetchEquipment = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get(`http://localhost:5000/multi_controls/equipment/?account_id=${accountId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.data) {
                throw new Error('No data received from server');
            }

            setEquipment(response.data);
        } catch (error) {
            console.error('Error fetching equipment:', error);
        }
    };

    const handleAddAlert = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.post(
                'http://localhost:5000/multi_controls/alerts/create',
                { ...newAlert, account_id: accountId },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data) {
                setAlerts([...alerts, response.data]);
                setShowAddForm(false);
                setNewAlert({
                    name: '',
                    type: 'warning',
                    message: '',
                    field_id: '',
                    equipment_id: ''
                });
            }
        } catch (error) {
            console.error('Error adding alert:', error);
            setError(error.response?.data?.message || 'Failed to add alert');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAlert(prev => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return (
            <div className="multi-control-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading alerts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="multi-control-page">
            <div className="page-header">
                <h2>Alerts</h2>
                <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                    {showAddForm ? 'Cancel' : 'Add Alert'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {showAddForm && (
                <div className="add-alert-form">
                    <form onSubmit={handleAddAlert}>
                        <div className="form-group">
                            <label htmlFor="name">Alert Name:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={newAlert.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="type">Type:</label>
                            <select
                                id="type"
                                name="type"
                                value={newAlert.type}
                                onChange={handleInputChange}
                            >
                                <option value="info">Info</option>
                                <option value="warning">Warning</option>
                                <option value="error">Error</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="message">Message:</label>
                            <textarea
                                id="message"
                                name="message"
                                value={newAlert.message}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="field_id">Field:</label>
                            <select
                                id="field_id"
                                name="field_id"
                                value={newAlert.field_id}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select a field</option>
                                {fields.map(field => (
                                    <option key={field.id} value={field.id}>
                                        {field.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="equipment_id">Equipment:</label>
                            <select
                                id="equipment_id"
                                name="equipment_id"
                                value={newAlert.equipment_id}
                                onChange={handleInputChange}
                            >
                                <option value="">Select equipment (optional)</option>
                                {equipment
                                    .filter(item => item.field_id === newAlert.field_id)
                                    .map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">Add Alert</button>
                            <button type="button" className="btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="alerts-container">
                <table className="alerts-list">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Message</th>
                            <th>Field</th>
                            <th>Equipment</th>
                            <th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alerts.map(alert => (
                            <tr key={alert.id} className={`alert-row ${alert.type}`}>
                                <td>{alert.name}</td>
                                <td>
                                    <span className={`status-badge ${alert.type}`}>
                                        {alert.type}
                                    </span>
                                </td>
                                <td>{alert.message}</td>
                                <td>{fields.find(f => f.id === alert.field_id)?.name || 'Unknown'}</td>
                                <td>{equipment.find(e => e.id === alert.equipment_id)?.name || 'N/A'}</td>
                                <td>{new Date(alert.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MultiControlAlerts; 