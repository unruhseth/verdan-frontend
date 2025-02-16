import { theme } from 'antd';

// Base color from logo: #8FB159
const colors = {
    primary: '#8FB159',
    primaryHover: '#9DC266',
    primaryActive: '#7A9A4A',
    primaryLight: '#E8F0DB',
    success: '#6B8C3E',
    warning: '#D4B742',
    error: '#D45B42',
    link: '#8FB159',
    linkHover: '#9DC266',
    border: '#D9E6C3',
};

export const getThemeConfig = (isDarkMode) => ({
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
        colorPrimary: colors.primary,
        colorLink: colors.link,
        colorLinkHover: colors.linkHover,
        colorSuccess: colors.success,
        colorWarning: colors.warning,
        colorError: colors.error,
        colorBgContainer: isDarkMode ? '#1F1F1F' : '#ffffff',
        colorBgLayout: isDarkMode ? '#141414' : '#F7F9F3',
        colorBgElevated: isDarkMode ? '#2F2F2F' : '#ffffff',
        colorBorder: isDarkMode ? '#434343' : colors.border,
        colorText: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
        colorTextSecondary: isDarkMode ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
        borderRadius: 6,
    },
    components: {
        Button: {
            colorPrimary: colors.primary,
            colorPrimaryHover: colors.primaryHover,
            colorPrimaryActive: colors.primaryActive,
        },
        Menu: {
            colorItemBg: 'transparent',
            colorItemBgSelected: isDarkMode ? 'rgba(143, 177, 89, 0.2)' : colors.primaryLight,
            colorItemBgHover: isDarkMode ? 'rgba(143, 177, 89, 0.1)' : 'rgba(143, 177, 89, 0.08)',
        },
        Table: {
            borderRadius: 8,
            borderRadiusLG: 8,
            padding: 16,
            paddingLG: 16,
            paddingSM: 12,
            paddingXS: 8,
            colorBgContainer: isDarkMode ? '#1F1F1F' : '#ffffff',
            headerBg: isDarkMode ? '#2F2F2F' : colors.primaryLight,
            headerColor: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
            rowHoverBg: isDarkMode ? 'rgba(143, 177, 89, 0.1)' : 'rgba(143, 177, 89, 0.05)',
            headerSplitColor: isDarkMode ? '#434343' : colors.border,
            borderColor: isDarkMode ? '#434343' : colors.border,
            cellPaddingBlock: 12,
            cellPaddingInline: 16,
            cellFontSize: 14,
            headerBorderRadius: 8,
            footerBorderRadius: 8,
            headerBg: isDarkMode ? '#2F2F2F' : colors.primaryLight,
            rowHoverBg: isDarkMode ? 'rgba(143, 177, 89, 0.1)' : 'rgba(143, 177, 89, 0.05)',
        },
        Card: {
            borderRadius: 8,
            borderRadiusLG: 8,
        }
    },
});

export const tableStyles = {
    '.ant-table-wrapper': {
        borderRadius: '8px',
        overflow: 'hidden',
        width: '100%',
    },
    '.ant-table': {
        borderRadius: '8px',
        overflow: 'hidden',
        width: '100%',
    },
    '.ant-table-container': {
        borderRadius: '8px',
        overflow: 'auto',
        width: '100%',
    },
    '.ant-table-content': {
        borderRadius: '8px',
        overflow: 'auto',
        width: '100%',
    },
    '.ant-table-body': {
        overflow: 'auto',
    },
    '.ant-table-thead > tr:first-child > th:first-child': {
        borderTopLeftRadius: '8px !important',
    },
    '.ant-table-thead > tr:first-child > th:last-child': {
        borderTopRightRadius: '8px !important',
    },
    '.ant-table-tbody > tr:last-child > td:first-child': {
        borderBottomLeftRadius: '8px !important',
    },
    '.ant-table-tbody > tr:last-child > td:last-child': {
        borderBottomRightRadius: '8px !important',
    },
    '.ant-table-cell': {
        fontSize: '14px',
        transition: 'background 0.2s, border-color 0.2s',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    '.ant-table-thead > tr > th': {
        fontWeight: 600,
        background: 'var(--header-bg) !important',
        borderBottom: '1px solid var(--border-color) !important',
    },
    '.ant-table-tbody > tr > td': {
        borderBottom: '1px solid var(--border-color)',
    },
    '.ant-table-tbody > tr:last-child > td': {
        borderBottom: 'none',
    },
    '.ant-table-tbody > tr:hover > td': {
        background: 'var(--row-hover-bg) !important',
    },
    '.ant-table-pagination': {
        margin: '16px 0 !important',
        padding: '0 16px',
    },
    '@media (max-width: 768px)': {
        '.ant-table': {
            borderRadius: '8px',
            overflow: 'auto',
        },
        '.ant-table-cell': {
            padding: '8px !important',
            maxWidth: '200px',
        }
    }
};

export const sidebarStyles = {
    light: {
        background: '#ffffff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    },
    dark: {
        background: '#1F1F1F',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
    },
}; 