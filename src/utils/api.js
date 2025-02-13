import axios from 'axios';
import { useParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Helper function to get account ID from URL
const getAccountIdFromUrl = () => {
    const pathParts = window.location.pathname.split('/');
    // Check for both /admin/accounts/:id and /account/:id patterns
    const accountIndex = pathParts.indexOf('accounts');
    const accountPathIndex = pathParts.indexOf('account');
    
    let accountId = null;
    if (accountIndex !== -1) {
        accountId = pathParts[accountIndex + 1];
    } else if (accountPathIndex !== -1) {
        accountId = pathParts[accountPathIndex + 1];
    }

    if (!accountId) {
        console.error('Account ID not found in URL:', window.location.pathname);
        throw new Error('Account ID not found in URL');
    }

    console.log('Extracted account ID from URL:', accountId);
    return accountId;
};

// Inventory API endpoints
export const inventoryApi = {
    getItems: async () => {
        const accountId = getAccountIdFromUrl();
        console.log('Fetching items for account:', accountId);
        
        try {
            const response = await api.get(`/inventory/items`, {
                params: {
                    account_id: parseInt(accountId, 10)
                }
            });
            console.log('GET items response:', response.data);
            return response;
        } catch (error) {
            console.error('Error fetching items:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    },

    createItem: async (itemData) => {
        const accountId = getAccountIdFromUrl();
        const payload = {
            ...itemData,
            account_id: parseInt(accountId, 10)
        };
        
        console.log('Creating item with payload:', JSON.stringify(payload, null, 2));
        
        try {
            const response = await api.post('/inventory/items', payload);
            console.log('Create item response:', response.data);
            return response;
        } catch (error) {
            console.error('Error creating item:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    },

    updateItem: async (itemId, itemData) => {
        const accountId = getAccountIdFromUrl();
        const payload = {
            ...itemData,
            account_id: parseInt(accountId, 10)
        };
        
        console.log('Updating item with payload:', JSON.stringify(payload, null, 2));
        
        try {
            const response = await api.put(`/inventory/items/${itemId}`, payload);
            console.log('Update item response:', response.data);
            return response;
        } catch (error) {
            console.error('Error updating item:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    },

    deleteItem: async (itemId) => {
        const accountId = getAccountIdFromUrl();
        console.log('Deleting item:', itemId, 'for account:', accountId);
        
        try {
            const response = await api.delete(`/inventory/items/${itemId}`, {
                data: { account_id: parseInt(accountId, 10) }
            });
            console.log('Delete item response:', response.data);
            return response;
        } catch (error) {
            console.error('Error deleting item:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    }
};

export default api; 