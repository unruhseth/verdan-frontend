import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';

const CreateAccountForm = ({ onCancel }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        subdomain: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const response = await fetch('https://verdan-api.onrender.com/accounts/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create account');
            }

            const data = await response.json();
            console.log('Created account:', data);
            setSuccess(true);
            
            // Reset form
            setFormData({ name: '', subdomain: '' });
            
            // Close form after a short delay
            setTimeout(() => {
                onCancel();
                // Optionally navigate to the new account
                if (data.id) {
                    navigate(`/admin/accounts/${data.id}`);
                }
            }, 1500);

        } catch (error) {
            console.error('Error creating account:', error);
            setError(error.message || 'Failed to create account');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Box 
            component="form" 
            onSubmit={handleSubmit}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                padding: 2,
                backgroundColor: 'background.paper',
                borderRadius: 1,
                boxShadow: 1
            }}
        >
            <Typography variant="h6" component="h2">
                Create New Account
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Account created successfully!
                </Alert>
            )}

            <TextField
                name="name"
                label="Account Name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
                size="small"
            />

            <TextField
                name="subdomain"
                label="Subdomain"
                value={formData.subdomain}
                onChange={handleChange}
                required
                fullWidth
                size="small"
                helperText="This will be used for the account's URL"
            />

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button 
                    type="button" 
                    onClick={onCancel}
                    variant="outlined"
                >
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    variant="contained"
                    disabled={!formData.name || !formData.subdomain || success}
                >
                    Create Account
                </Button>
            </Box>
        </Box>
    );
};

export default CreateAccountForm; 