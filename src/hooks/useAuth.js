import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api, { authApi } from '../utils/api';

const AuthContext = createContext(null);

// Helper to get cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Initialize state from cookies and session storage
const initializeAuthState = () => {
  const userInfoStr = sessionStorage.getItem('userInfo');
  const accessToken = getCookie('access_token_cookie');
  const refreshToken = getCookie('refresh_token_cookie');
  
  try {
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
    return {
      isAuthenticated: !!accessToken && !!refreshToken && !!userInfo,
      userInfo: userInfo
    };
  } catch (e) {
    console.error('Error parsing stored user info:', e);
    return { isAuthenticated: false, userInfo: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkAuth = useCallback(async () => {
    if (window.location.pathname === '/login') {
      return;
    }

    const userInfoStr = sessionStorage.getItem('userInfo');
    const accessToken = sessionStorage.getItem('access_token');

    console.log('Checking auth state:', {
      hasUserInfo: !!userInfoStr,
      hasAccessToken: !!accessToken
    });

    if (!accessToken || !userInfoStr) {
      setIsAuthenticated(false);
      setUserInfo(null);
      return;
    }

    try {
      const userInfo = JSON.parse(userInfoStr);
      if (!userInfo || !userInfo.role || !userInfo.account_id) {
        throw new Error('Invalid user info');
      }
      setIsAuthenticated(true);
      setUserInfo(userInfo);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUserInfo(null);
      sessionStorage.removeItem('userInfo');
      sessionStorage.removeItem('access_token');
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Starting login process...');
      
      const response = await authApi.login(email, password);
      
      console.log('Login response received:', {
        hasUser: !!response.user,
        userRole: response.user?.role
      });

      // Store user info
      const userInfo = {
        role: response.user.role,
        account_id: response.user.account_id,
        id: response.user.id,
        email: response.user.email,
        name: response.user.name
      };
      
      sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      // Verify user info was stored
      const storedUserInfo = sessionStorage.getItem('userInfo');
      
      if (!storedUserInfo) {
        throw new Error('Failed to store user info');
      }

      setIsAuthenticated(true);
      setUserInfo(userInfo);
      
      return response;
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      setError(error.response?.data?.error || error.message || 'Login failed');
      setIsAuthenticated(false);
      setUserInfo(null);
      sessionStorage.removeItem('userInfo');
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      sessionStorage.removeItem('userInfo');
      setIsAuthenticated(false);
      setUserInfo(null);
      setError(null);
      setIsLoading(false);
      window.location.href = '/login';
    }
  }, []);

  const value = {
    isAuthenticated,
    userInfo,
    error,
    isLoading,
    login,
    logout,
    checkAuth,
    clearError: () => setError(null)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
