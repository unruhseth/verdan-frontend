import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import EquipmentList from '../../../components/apps/multi-control/EquipmentList';
import '../../../styles/multi-control.css';

const MultiControlEquipment = () => {
    const { accountId } = useParams();
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newEquipment, setNewEquipment] = useState({
        name: '',
        type: 'sensor',
        status: 'active',
        field_id: ''
    });
    const [fields, setFields] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchEquipment();
        fetchFields();
    }, [accountId]);

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
            setLoading(false);
        } catch (error) {
            console.error('Error fetching equipment:', error);
            setError(error.message || 'Failed to load equipment');
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

    const handleAddEquipment = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.post(
                'http://localhost:5000/multi_controls/equipment/create',
                { ...newEquipment, account_id: accountId },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data) {
                setEquipment([...equipment, response.data]);
                setShowAddForm(false);
                setNewEquipment({
                    name: '',
                    type: 'sensor',
                    status: 'active',
                    field_id: ''
                });
            }
        } catch (error) {
            console.error('Error adding equipment:', error);
            setError(error.response?.data?.message || 'Failed to add equipment');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEquipment(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = async (equipmentData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found.');

            const response = await axios.put(
                `http://localhost:5000/multi_controls/equipment/${equipmentData.id}`,
                {
                    account_id: parseInt(accountId),
                    ...equipmentData
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data) {
                const updatedEquipment = equipment.map(item => 
                    item.id === equipmentData.id ? response.data : item
                );
                setEquipment(updatedEquipment);
            }
        } catch (error) {
            console.error('Error updating equipment:', error);
            setError(error.response?.data?.message || 'Failed to update equipment.');
        }
    };

    const handleDelete = async (equipmentId) => {
        if (!window.confirm('Are you sure you want to delete this equipment?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found.');

            await axios.delete(`http://localhost:5000/multi_controls/equipment/${equipmentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    account_id: parseInt(accountId)
                }
            });

            setEquipment(equipment.filter(item => item.id !== equipmentId));
        } catch (error) {
            console.error('Error deleting equipment:', error);
            setError(error.response?.data?.message || 'Failed to delete equipment.');
        }
    };

    if (loading) {
        return (
            <div className="multi-control-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading equipment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="multi-control-page">
            <div className="page-header">
                <h2>Equipment</h2>
                <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                    {showAddForm ? 'Cancel' : 'Add Equipment'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {showAddForm && (
                <div className="add-equipment-form">
                    <form onSubmit={handleAddEquipment}>
                        <div className="form-group">
                            <label htmlFor="name">Equipment Name:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={newEquipment.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="type">Type:</label>
                            <select
                                id="type"
                                name="type"
                                value={newEquipment.type}
                                onChange={handleInputChange}
                            >
                                <option value="sensor">Sensor</option>
                                <option value="controller">Controller</option>
                                <option value="pump">Pump</option>
                                <option value="valve">Valve</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="field_id">Field:</label>
                            <select
                                id="field_id"
                                name="field_id"
                                value={newEquipment.field_id}
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
                            <label htmlFor="status">Status:</label>
                            <select
                                id="status"
                                name="status"
                                value={newEquipment.status}
                                onChange={handleInputChange}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">Add Equipment</button>
                            <button type="button" className="btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="equipment-container">
                <EquipmentList
                    equipment={equipment}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
};

export default MultiControlEquipment; 