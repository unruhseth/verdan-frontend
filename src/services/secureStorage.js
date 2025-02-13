import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'your-fallback-encryption-key';

const secureStorage = {
    encrypt: (data) => {
        return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
    },

    decrypt: (encryptedData) => {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
            return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        } catch (error) {
            return null;
        }
    },

    setPersistent: (key, value) => {
        const encryptedValue = secureStorage.encrypt(value);
        localStorage.setItem(key, encryptedValue);
    },

    getPersistent: (key) => {
        const encryptedValue = localStorage.getItem(key);
        if (!encryptedValue) return null;
        return secureStorage.decrypt(encryptedValue);
    },

    setSession: (key, value) => {
        sessionStorage.setItem(key, JSON.stringify(value));
    },

    getSession: (key) => {
        const value = sessionStorage.getItem(key);
        try {
            return value ? JSON.parse(value) : null;
        } catch {
            return null;
        }
    },

    clearAll: () => {
        localStorage.removeItem('auth');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('auth');
        sessionStorage.removeItem('refreshToken');
    },

    clearPersistent: () => {
        localStorage.removeItem('auth');
        localStorage.removeItem('refreshToken');
    },

    clearSession: () => {
        sessionStorage.removeItem('auth');
        sessionStorage.removeItem('refreshToken');
    }
};

export default secureStorage; 