import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../../../styles/multi-control.css';

const MultiControlDashboard = () => {
    const { accountId, '*': subPath } = useParams();
    const fieldId = subPath; // The fieldId is in the subPath
    const [field, setField] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchFieldDetails();
    }, [accountId, fieldId]);

    const fetchFieldDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found.');

            const response = await axios.get(`http://localhost:5000/multi_controls/fields/${fieldId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    account_id: accountId
                }
            });

            setField(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching field details:', error);
            setError(error.response?.data?.message || 'Failed to load field details.');
            setLoading(false);
        }
    };

    const handleFileUpload = async (type, file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('account_id', accountId);
            formData.append('field_id', fieldId);

            const response = await axios.post(
                `http://localhost:5000/multi_controls/fields/upload_${type.toLowerCase()}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Refresh field details after successful upload
            fetchFieldDetails();
        } catch (error) {
            console.error(`Error uploading ${type} file:`, error);
            setError(error.response?.data?.message || `Failed to upload ${type} file.`);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading field details...</p>
            </div>
        );
    }

    return (
        <div className="multi-control-page">
            <div className="page-header">
                <h2>Field Dashboard - {field?.name || 'Unknown Field'}</h2>
            </div>

            {error && <p className="error-message">{error}</p>}

            {field && (
                <div className="field-dashboard">
                    <div className="field-details">
                        <div className="detail-section">
                            <h3>Field Information</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Name:</label>
                                    <span>{field.name}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Location:</label>
                                    <span>{field.latitude}°, {field.longitude}°</span>
                                </div>
                                <div className="detail-item">
                                    <label>Pressure:</label>
                                    <span>{field.pressure} PSI</span>
                                </div>
                                <div className="detail-item">
                                    <label>Flow Rate:</label>
                                    <span>{field.flow_rate} GPM</span>
                                </div>
                                <div className="detail-item">
                                    <label>Current Zone:</label>
                                    <span>{field.current_zone}</span>
                                </div>
                            </div>
                        </div>

                        <div className="file-upload-section">
                            <h3>Field Files</h3>
                            <div className="upload-buttons">
                                <div className="upload-group">
                                    <label htmlFor="kml-upload" className="btn secondary">
                                        Upload KML File
                                    </label>
                                    <input
                                        id="kml-upload"
                                        type="file"
                                        accept=".kml"
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleFileUpload('KML', e.target.files[0])}
                                    />
                                </div>
                                <div className="upload-group">
                                    <label htmlFor="shp-upload" className="btn secondary">
                                        Upload SHP File
                                    </label>
                                    <input
                                        id="shp-upload"
                                        type="file"
                                        accept=".shp"
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleFileUpload('SHP', e.target.files[0])}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiControlDashboard; 