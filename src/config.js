// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// API Configuration
const getApiBaseUrl = () => {
    if (isDevelopment) {
        // In development, use the local subdomain
        return process.env.REACT_APP_API_URL || 'http://api.verdan.local:5005';
    }
    // In production, use api subdomain
    return 'https://api.verdan.io';
};

// Cookie domain configuration
const getCookieDomain = () => {
    if (isDevelopment) {
        return '.verdan.local';
    }
    return '.verdan.io';
};

export const config = {
    apiBaseUrl: getApiBaseUrl(),
    isDevelopment,
    isProduction,
    // Cookie settings
    cookieOptions: {
        path: '/',
        domain: getCookieDomain(),
        secure: false,  // Set to false for HTTP in development
        sameSite: 'Lax',  // Use Lax for HTTP
        httpOnly: true,
        maxAge: 2592000  // 30 days in seconds
    }
};

// For debugging
if (isDevelopment) {
    console.log('Environment:', process.env.NODE_ENV);
    console.log('API Base URL:', config.apiBaseUrl);
    console.log('Cookie Domain:', config.cookieOptions.domain);
    console.log('Cookie Settings:', config.cookieOptions);
}
