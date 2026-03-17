import { Badge } from './Badge';

const STATUS_CONFIG = {
    pending: { label: '待處理', cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    processing: { label: '處理中', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    completed: { label: '已完成', cls: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    cancelled: { label: '已取消', cls: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
};

export function StatusBadge({ status }) {
    const { label, cls } = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return <Badge className={cls}>{label}</Badge>;
}
