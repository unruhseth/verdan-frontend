import axios from 'axios';
import { config } from '../config';

// Helper to parse cookies
const getCookie = (name) => {
  try {
    console.log('Getting cookie:', { name, allCookies: document.cookie });
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    console.log('Parsed cookies:', cookies);
    return cookies[name] || null;
  } catch (error) {
    console.error('Error parsing cookie:', error);
    return null;
  }
};

// Helper to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Add 60 second buffer to prevent edge cases
    return (payload.exp * 1000) - 60000 < Date.now();
  } catch (e) {
    console.error('Error parsing token:', e);
    return true;
  }
};

// Refresh token function
const refreshAuthToken = async () => {
  try {
    console.log('Attempting to refresh auth token...');
    const refreshToken = getCookie('refresh_token');
    const csrfRefreshToken = getCookie('csrf_refresh_token');
    
    if (!refreshToken || !csrfRefreshToken) {
      throw new Error('Missing refresh token');
    }

    const response = await axios.post(`${config.apiBaseUrl}/auth/refresh`, {}, {
      headers: {
        'X-CSRF-TOKEN': csrfRefreshToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    });

    if (!response.data?.access_token) {
      throw new Error('Invalid refresh response - no access token');
    }

    // Store new access token
    sessionStorage.setItem('access_token', response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Authentication API endpoints
export const authApi = {
  login: async (email, password) => {
    try {
      console.log('Making login request with:', { email });
      
      const response = await axios.post(
        `${config.apiBaseUrl}/auth/login`,
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );

      console.log('Login response:', {
        status: response.status,
        hasData: !!response.data,
        hasUser: !!response.data?.user,
        hasAccessToken: !!response.data?.access_token
      });

      if (!response.data || !response.data.user || !response.data.access_token) {
        throw new Error('Invalid response from server');
      }

      // Store access token and user info in sessionStorage
      sessionStorage.setItem('access_token', response.data.access_token);
      sessionStorage.setItem('userInfo', JSON.stringify(response.data.user));

      return response.data;
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
  }
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Skip auth for login endpoint
    if (config.url.includes('/auth/login')) {
      return config;
    }

    // Get access token from sessionStorage
    const accessToken = sessionStorage.getItem('access_token');
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const newAccessToken = await refreshAuthToken();
        
        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear auth state and redirect to login
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('userInfo');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Account API endpoints
export const accountApi = {
  getAccounts: () => api.get('/accounts/'),
  createAccount: (data) => api.post('/accounts/', data),
  updateAccount: (id, data) => api.put(`/accounts/${id}`, data),
  deleteAccount: (id) => api.delete(`/accounts/${id}`),
  getAccountDetails: (id) => api.get(`/admin/accounts/${id}`),
  getAccountUsers: (id) => api.get(`/accounts/${id}/users`),
  createAccountUser: (id, data) => api.post(`/accounts/${id}/users`, data),
  updateAccountUser: (accountId, userId, data) => api.put(`/accounts/${accountId}/users/${userId}`, data),
  deleteAccountUser: (accountId, userId) => api.delete(`/accounts/${accountId}/users/${userId}`),
  resetUserPassword: (accountId, userId, data) => api.put(`/accounts/${accountId}/users/${userId}/reset-password`, data),
  getAccountApps: (id) => api.get(`/admin/accounts/${id}/apps`),
  getInstalledApps: (id) => api.get(`/admin/accounts/${id}/apps/installed`),
  installApp: (accountId, appId) => api.post(`/admin/accounts/${accountId}/apps/install`, { app_id: appId }),
  uninstallApp: (accountId, appId) => api.post(`/admin/accounts/${accountId}/apps/uninstall`, { app_id: appId }),
};

// Inventory API endpoints
export const inventoryApi = {
  getItems: () => api.get('/inventory/items'),
  createItem: (itemData) => api.post('/inventory/items', itemData),
  updateItem: (id, itemData) => api.put(`/inventory/items/${id}`, itemData),
  deleteItem: (id) => api.delete(`/inventory/items/${id}`)
};

// App Management API endpoints
export const appManagementApi = {
    listAvailableApps: () => api.get('/admin/apps'),
    listInstalledApps: async (accountId) => {
        try {
            const response = await api.get(`/admin/accounts/${accountId}/apps/installed`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error fetching installed apps:', error);

            if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
                return { 
                    success: true, 
                    data: [], 
                    warning: 'Unable to fetch installed apps due to connection issues.'
                };
            }

            // Handle database schema errors gracefully
            if (error.response?.data?.error?.includes('UndefinedColumn')) {
                return { success: true, data: [] };
            }

            throw error;
        }
    },
    installApp: async (accountId, appId) => {
        try {
            // Log the request details for debugging
            console.log('Installing app:', { accountId, appId });
            
            const response = await api.post(`/admin/accounts/${accountId}/apps/install`, { 
                app_id: appId // Use UUID directly
            });
            
            // Log successful response
            console.log('Install response:', response.data);
            
            return { success: true, data: response.data };
        } catch (error) {
            // Log detailed error information
            console.error('Install error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                requestData: error.config?.data
            });

            // Handle database schema errors
            if (error.response?.data?.error?.includes('UndefinedColumn')) {
                return {
                    success: false,
                    error: 'Database setup incomplete. Please contact support.'
                };
            }

            // Handle specific error codes based on API documentation
            switch (error.response?.status) {
                case 400:
                    return {
                        success: false,
                        error: 'Invalid app ID or missing parameters. Please try again.'
                    };
                case 401:
                    return {
                        success: false,
                        error: 'Authentication required. Please log in again.'
                    };
                case 403:
                    return {
                        success: false,
                        error: 'You do not have permission to install apps.'
                    };
                case 404:
                    return {
                        success: false,
                        error: 'App not found. Please check if the app is available.'
                    };
                case 429:
                    return {
                        success: false,
                        error: 'Too many installation attempts. Please wait a moment and try again.'
                    };
                case 500:
                    return {
                        success: false,
                        error: 'Server error during installation. Please try again or contact support.'
                    };
                default:
                    return { 
                        success: false, 
                        error: error.response?.data?.error || 'Failed to install app. Please try again.' 
                    };
            }
        }
    },
    uninstallApp: async (accountId, appId) => {
        try {
            // Log the request details for debugging
            console.log('Uninstalling app:', { accountId, appId });
            
            const response = await api.post(`/admin/accounts/${accountId}/apps/uninstall`, { 
                app_id: appId // Use UUID directly
            });
            
            // Log successful response
            console.log('Uninstall response:', response.data);
            
            return { success: true, data: response.data };
        } catch (error) {
            // Log detailed error information
            console.error('Uninstall error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                requestData: error.config?.data
            });
            
            // Handle specific error codes based on API documentation
            switch (error.response?.status) {
                case 400:
                    return {
                        success: false,
                        error: 'Invalid app ID or missing parameters. Please try again.'
                    };
                case 401:
                    return {
                        success: false,
                        error: 'Authentication required. Please log in again.'
                    };
                case 403:
                    return {
                        success: false,
                        error: 'You do not have permission to uninstall apps.'
                    };
                case 404:
                    return {
                        success: false,
                        error: 'App not found or not installed.'
                    };
                case 429:
                    return {
                        success: false,
                        error: 'Too many uninstallation attempts. Please wait a moment and try again.'
                    };
                default:
                    return { 
                        success: false, 
                        error: error.response?.data?.error || 'Failed to uninstall app. Please try again.' 
                    };
            }
        }
    },
    getAppStatus: (accountId, appId) => api.get(`/admin/accounts/${accountId}/apps/${appId}/status`),
};

export default api;