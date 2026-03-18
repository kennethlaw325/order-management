import { clsx } from 'clsx';
import { useSettings } from './contexts/SettingsContext';

export const cn = (...inputs) => clsx(inputs);

// Hook version — triggers re-render when currency changes
export function useFormatCurrency() {
    const { currency } = useSettings();
    return (amount) => formatCurrency(amount, currency);
}

export const formatCurrency = (amount, currencyCode) => {
    const currency = currencyCode || localStorage.getItem('currency') || 'TWD';
    const localeMap = { TWD: 'zh-TW', HKD: 'zh-HK', USD: 'en-US', CNY: 'zh-CN' };
    return new Intl.NumberFormat(localeMap[currency] || 'zh-TW', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0
    }).format(amount);
};

export const getStatusLabel = (status) => {
    const labels = {
        pending: '待處理',
        processing: '處理中',
        completed: '已完成',
        cancelled: '已取消'
    };
    return labels[status] || status;
};

export const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
