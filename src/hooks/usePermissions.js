import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export const ROLES = {
    MASTER_ADMIN: 'master_admin',
    ADMIN: 'admin',
    ACCOUNT_ADMIN: 'account_admin',
    ACCOUNT_USER: 'user'
};

export const usePermissions = () => {
    const { accountId } = useParams();
    const [userRole, setUserRole] = useState(localStorage.getItem('role'));
    const [userAccountId, setUserAccountId] = useState(localStorage.getItem('accountId'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPermissions = () => {
            const role = localStorage.getItem('role');
            const accId = localStorage.getItem('accountId');
            
            console.log('Loading permissions:', { 
                role, 
                accId,
                urlAccountId: accountId,
                pathname: window.location.pathname
            });
            
            setUserRole(role);
            setUserAccountId(accId);
            setIsLoading(false);
        };

        loadPermissions();

        // Update permissions when localStorage changes
        const handleStorageChange = (e) => {
            if (e.key === 'role' || e.key === 'accountId') {
                console.log('Storage changed:', {
                    key: e.key,
                    oldValue: e.oldValue,
                    newValue: e.newValue
                });
                loadPermissions();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [accountId]);

    // Check if user is any type of admin
    const isAdmin = () => {
        const result = ['master_admin', 'admin'].includes(userRole);
        console.log('isAdmin check:', { userRole, result });
        return result;
    };

    // Check if user is specifically a master admin
    const isMasterAdmin = () => {
        console.log('Checking isMasterAdmin, role:', userRole);
        return userRole === 'master_admin';
    };

    // Check if user is an account admin for the current account
    const isAccountAdmin = () => {
        console.log('Checking isAccountAdmin:', { userRole, accountId, userAccountId });
        if (!accountId) return false;
        // Convert both to strings for comparison to handle type mismatches
        return userRole === 'account_admin' && userAccountId?.toString() === accountId?.toString();
    };

    // Check if user has access to the current account
    const hasAccountAccess = () => {
        console.log('Checking account access:', { 
            userRole,
            userAccountId,
            urlAccountId: accountId,
            pathname: window.location.pathname
        });

        // No account context, access is allowed
        if (!accountId) {
            console.log('No account context, access allowed');
            return true;
        }

        // Admins can access all accounts
        if (isAdmin()) {
            console.log('Admin access granted');
            return true;
        }

        // For user roles, check account ID match
        const hasAccess = userAccountId?.toString() === accountId?.toString();
        console.log('User account access check:', { 
            hasAccess,
            userAccountId,
            urlAccountId: accountId
        });
        
        return hasAccess;
    };

    // Check if user can manage apps
    const canManageApps = () => {
        const result = isAdmin() || userRole === 'account_admin';
        console.log('canManageApps check:', { userRole, result });
        return result;
    };

    // Check if user can manage users
    const canManageUsers = () => {
        const result = isAdmin() || userRole === 'account_admin';
        console.log('canManageUsers check:', { userRole, result });
        return result;
    };

    // Check if user can manage account settings
    const canManageAccountSettings = () => {
        console.log('Checking canManageAccountSettings:', { userRole });
        return isAdmin() || isAccountAdmin();
    };

    // Check if user can view sensitive information
    const canViewSensitiveInfo = () => {
        console.log('Checking canViewSensitiveInfo:', { userRole });
        return isAdmin() || isAccountAdmin();
    };

    // Check if user can delete things (might want to restrict this to higher levels)
    const canDelete = () => {
        console.log('Checking canDelete:', { userRole });
        return isAdmin();
    };

    return {
        userRole,
        userAccountId,
        isLoading,
        isAdmin,
        isMasterAdmin,
        isAccountAdmin,
        hasAccountAccess,
        canManageApps,
        canManageUsers,
        canManageAccountSettings,
        canViewSensitiveInfo,
        canDelete,
    };
}; 