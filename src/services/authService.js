import axios from 'axios';
import { config } from '../config';

// In-memory storage for access token
let accessToken = null;

// Create an axios instance for auth requests
const authAxios = axios.create({
    baseURL: config.apiBaseUrl,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    // Add specific cookie handling
    xsrfCookieName: 'csrf_access_token',
    xsrfHeaderName: 'X-CSRF-TOKEN'
});

// Create an axios instance for API requests
export const apiClient = axios.create({
    baseURL: config.apiBaseUrl,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    // Add specific cookie handling
    xsrfCookieName: 'csrf_access_token',
    xsrfHeaderName: 'X-CSRF-TOKEN'
});

// Add auth header interceptor
apiClient.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the token
                const response = await authAxios.post('/auth/refresh');
                
                if (response.data?.access_token) {
                    // Store new access token
                    accessToken = response.data.access_token;
                    
                    // Update the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    
                    // Retry the original request
                    return apiClient(originalRequest);
                }
                
                // If no access token in response, throw error
                throw new Error('No access token in refresh response');
            } catch (refreshError) {
                // If refresh fails, clear auth state and redirect to login
                accessToken = null;
                window.dispatchEvent(new CustomEvent('auth-state-changed', { 
                    detail: { isAuthenticated: false }
                }));
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

const authService = {
    async login(credentials) {
        try {
            const response = await authAxios.post('/auth/login', credentials);
            
            if (response.data?.access_token) {
                // Store access token in memory
                accessToken = response.data.access_token;
                
                // Emit auth state change event
                window.dispatchEvent(new CustomEvent('auth-state-changed', { 
                    detail: { 
                        isAuthenticated: true, 
                        user: response.data.user 
                    }
                }));
                
                return { 
                    success: true, 
                    data: response.data 
                };
            }
            
            throw new Error('Invalid response format - missing access token');
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: error.response?.data?.error || error.message || 'Login failed'
            };
        }
    },

    async logout() {
        try {
            await authAxios.post('/auth/logout');
            accessToken = null;
            
            // Clear cookies
            document.cookie = `refresh_token_cookie=; path=/; domain=.verdan.local; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
            
            window.dispatchEvent(new CustomEvent('auth-state-changed', { 
                detail: { isAuthenticated: false }
            }));
            
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: 'Logout failed' };
        }
    },

    async checkAuthState() {
        try {
            // First try to get user info with current access token
            if (accessToken) {
                try {
                    const response = await apiClient.get('/auth/me');
                    if (response.data) {
                        return { 
                            success: true, 
                            isAuthenticated: true,
                            user: response.data
                        };
                    }
                } catch (error) {
                    // If access token fails, try refresh
                    if (error.response?.status === 401) {
                        try {
                            const refreshResponse = await authAxios.post('/auth/refresh');
                            if (refreshResponse.data?.access_token) {
                                accessToken = refreshResponse.data.access_token;
                                const userResponse = await apiClient.get('/auth/me');
                                return { 
                                    success: true, 
                                    isAuthenticated: true,
                                    user: userResponse.data
                                };
                            }
                        } catch (refreshError) {
                            // If refresh fails, clear state
                            accessToken = null;
                            return { 
                                success: true, 
                                isAuthenticated: false 
                            };
                        }
                    }
                }
            }

            // If we get here, we're not authenticated
            accessToken = null;
            return { 
                success: true, 
                isAuthenticated: false 
            };
        } catch (error) {
            console.error('Auth state check error:', error);
            accessToken = null;
            return { 
                success: true, 
                isAuthenticated: false 
            };
        }
    },

    getAccessToken() {
        return accessToken;
    },

    isAuthenticated() {
        return !!accessToken;
    }
};

export default authService; 