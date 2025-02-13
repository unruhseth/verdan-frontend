import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FieldList from '../../../components/apps/multi-control/FieldList';

const MultiControlPage = () => {
    const { accountId } = useParams();
    const navigate = useNavigate();
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newField, setNewField] = useState({
        name: '',
        location: '',
        status: 'active'
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchFields();
    }, [accountId]);

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
            setLoading(false);
        } catch (error) {
            console.error('Error fetching fields:', error);
            setError(error.message || 'Failed to load fields');
            setLoading(false);
        }
    };

    const handleAddField = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.post(
                'http://localhost:5000/multi_controls/fields/create',
                { ...newField, account_id: accountId },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data) {
                setFields([...fields, response.data]);
                setShowAddForm(false);
                setNewField({ name: '', location: '', status: 'active' });
            }
        } catch (error) {
            console.error('Error adding field:', error);
            setError(error.response?.data?.message || 'Failed to add field');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewField(prev => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return (
            <div className="multi-control-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading fields...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="multi-control-page">
            <div className="page-header">
                <h2>Fields</h2>
                <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                    {showAddForm ? 'Cancel' : 'Add Field'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {showAddForm && (
                <div className="add-field-form">
                    <form onSubmit={handleAddField}>
                        <div className="form-group">
                            <label htmlFor="name">Field Name:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={newField.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="location">Location:</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={newField.location}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="status">Status:</label>
                            <select
                                id="status"
                                name="status"
                                value={newField.status}
                                onChange={handleInputChange}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">Add Field</button>
                            <button type="button" className="btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="fields-container">
                <FieldList fields={fields} />
            </div>
        </div>
    );
};

export default MultiControlPage; 