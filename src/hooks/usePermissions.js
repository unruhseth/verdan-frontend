import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from './useAuth';

export const ROLES = {
    MASTER_ADMIN: 'master_admin',
    ADMIN: 'admin',
    ACCOUNT_ADMIN: 'account_admin',
    ACCOUNT_USER: 'user'
};

export const usePermissions = () => {
    const { accountId } = useParams();
    const { isAuthenticated, isLoading: authLoading, userInfo } = useAuth();

    // Check if user is any type of admin
    const isAdmin = useCallback(() => {
        return userInfo && ['master_admin', 'admin'].includes(userInfo.role);
    }, [userInfo]);

    // Check if user is specifically a master admin
    const isMasterAdmin = useCallback(() => {
        return userInfo && userInfo.role === ROLES.MASTER_ADMIN;
    }, [userInfo]);

    // Check if user is an account admin for the current account
    const isAccountAdmin = useCallback(() => {
        if (!accountId || !userInfo) return false;
        return userInfo.role === ROLES.ACCOUNT_ADMIN && 
               userInfo.account_id?.toString() === accountId?.toString();
    }, [userInfo, accountId]);

    // Check if user has access to the current account
    const hasAccountAccess = useCallback(() => {
        if (!isAuthenticated || !userInfo) return false;
        if (!accountId) return true;
        if (isAdmin()) return true;
        return userInfo.account_id?.toString() === accountId?.toString();
    }, [accountId, userInfo, isAdmin, isAuthenticated]);

    // Check if user can manage apps
    const canManageApps = useCallback(() => {
        if (!isAuthenticated || !userInfo) return false;
        return isAdmin() || userInfo.role === ROLES.ACCOUNT_ADMIN;
    }, [userInfo, isAdmin, isAuthenticated]);

    // Check if user can manage users
    const canManageUsers = useCallback(() => {
        if (!isAuthenticated || !userInfo) return false;
        return isAdmin() || userInfo.role === ROLES.ACCOUNT_ADMIN;
    }, [userInfo, isAdmin, isAuthenticated]);

    // Check if user can manage account settings
    const canManageAccountSettings = useCallback(() => {
        if (!isAuthenticated || !userInfo) return false;
        return isAdmin() || isAccountAdmin();
    }, [isAdmin, isAccountAdmin, isAuthenticated]);

    // Check if user can view sensitive information
    const canViewSensitiveInfo = useCallback(() => {
        console.log('Checking canViewSensitiveInfo:', { userInfo });
        return isAdmin() || isAccountAdmin();
    }, [isAdmin, isAccountAdmin]);

    // Check if user can delete things (might want to restrict this to higher levels)
    const canDelete = useCallback(() => {
        console.log('Checking canDelete:', { userInfo });
        return isAdmin();
    }, [isAdmin]);

    return {
        userRole: userInfo?.role,
        userAccountId: userInfo?.account_id,
        isLoading: authLoading,
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