import { clsx } from 'clsx';
export const cn = (...inputs) => clsx(inputs);

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD',
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
