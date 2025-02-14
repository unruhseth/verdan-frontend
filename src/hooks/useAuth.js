import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import secureStorage from '../services/secureStorage';

const API_URL = 'https://verdan-api.onrender.com';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [auth, setAuth] = useState(null);
    const navigate = useNavigate();

    // Create axios instance with default config
    const api = axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        withCredentials: false // Disable credentials for now
    });

    // Add request interceptor for debugging
    api.interceptors.request.use(request => {
        console.log('Starting Request:', {
            url: request.url,
            method: request.method,
            headers: request.headers,
            data: request.data
        });
        return request;
    });

    // Add response interceptor for debugging
    api.interceptors.response.use(
        response => {
            console.log('Response:', {
                status: response.status,
                headers: response.headers,
                data: response.data
            });
            return response;
        },
        error => {
            console.error('Response Error:', {
                message: error.message,
                response: error.response,
                request: error.request
            });
            throw error;
        }
    );

    // Check for existing auth on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            const storedRole = localStorage.getItem('role');
            console.log('Current auth state:', {
                token: token ? 'exists' : 'missing',
                role: storedRole,
                isAuthenticated,
                isLoading
            });

            if (!token) {
                console.log('No token found, setting not authenticated');
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            // Verify token is still valid
            console.log('Sending verification request...');
            const response = await axios.get(`${API_URL}/auth/verify`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Token verification response:', {
                status: response.status,
                data: response.data
            });
            
            if (response.status === 200 && response.data) {
                const data = response.data;
                console.log('Verification successful:', {
                    data,
                    previousAuth: auth
                });

                // Set authentication state
                setAuth(data);
                setIsAuthenticated(true);
                
                // Ensure role and accountId are set in localStorage
                if (data.role) {
                    console.log('Setting role:', data.role);
                    localStorage.setItem('role', data.role);
                }
                if (data.account_id) {
                    console.log('Setting accountId:', data.account_id);
                    localStorage.setItem('accountId', data.account_id.toString());
                }
            } else {
                console.log('Token verification failed:', response.data);
                handleLogout();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            handleLogout();
        } finally {
            console.log('Auth check completed. Final state:', {
                isAuthenticated,
                isLoading,
                auth: auth ? 'exists' : 'null'
            });
            setIsLoading(false);
        }
    };

    const handleLogin = async (credentials) => {
        console.log('Login attempt:', { email: credentials.email });
        setError(null);
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', credentials);

            console.log('Login response status:', response.status);
            
            const data = await response.json();
            console.log('Login response data:', {
                status: response.status,
                message: data.message,
                hasToken: !!data.token,
                role: data.role,
                accountId: data.account_id
            });

            if (!response.ok) {
                const error = new Error(data.message || 'Login failed');
                error.status = response.status;
                throw error;
            }

            if (!data.token) {
                throw new Error('No token received from server');
            }

            if (!data.role) {
                throw new Error('No role received from server');
            }

            // Clear any existing auth data
            localStorage.clear();

            // Store new auth data
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            
            if (data.account_id !== undefined && data.account_id !== null) {
                localStorage.setItem('accountId', data.account_id.toString());
                console.log('Stored accountId:', data.account_id.toString());
            }

            console.log('Authentication successful:', {
                role: data.role,
                accountId: data.account_id,
                hasToken: !!data.token
            });

            await handleLoginSuccess(data);
        } catch (error) {
            console.error('Login error:', {
                message: error.message,
                status: error.status,
                stack: error.stack
            });

            // Set specific error messages based on the error
            if (error.status === 401) {
                setError('User not found. Please check your email address.');
            } else if (error.message.includes('password')) {
                setError('Incorrect password. Please try again.');
            } else {
                setError(error.message || 'Failed to login');
            }
            
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginSuccess = async (data) => {
        console.log('Processing successful login:', {
            role: data.role,
            accountId: data.account_id
        });

        try {
            setIsAuthenticated(true);
            
            const role = data.role;
            const accountId = data.account_id;

            // Determine navigation based on role
            if (['master_admin', 'admin'].includes(role)) {
                console.log('Admin login - navigating to /admin');
                navigate('/admin');
            } else if (['account_admin', 'user'].includes(role)) {
                if (!accountId) {
                    console.error('No account ID for user/account_admin role');
                    throw new Error('Account ID is required for user access');
                }
                console.log(`User login - navigating to /account/${accountId}/dashboard`);
                navigate(`/account/${accountId}/dashboard`);
            } else {
                console.error('Unknown role:', role);
                throw new Error('Invalid role received');
            }
        } catch (error) {
            console.error('Navigation error:', error);
            setError(error.message);
            // Clear auth data on navigation error
            localStorage.clear();
            setIsAuthenticated(false);
            throw error;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('accountId');
        setIsAuthenticated(false);
        setAuth(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isLoading,
            error,
            login: handleLogin,
            logout: handleLogout,
            checkAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
