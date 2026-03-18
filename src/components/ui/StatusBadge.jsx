// src/components/ui/StatusBadge.jsx
import { Badge } from './Badge';

const STATUS_CONFIG = {
    pending: {
        label: '待處理',
        cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        dot: 'bg-amber-500 dark:bg-amber-400',
    },
    processing: {
        label: '處理中',
        cls: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
        dot: 'bg-blue-500 dark:bg-blue-400',
    },
    completed: {
        label: '已完成',
        cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
        dot: 'bg-emerald-500 dark:bg-emerald-400',
    },
    cancelled: {
        label: '已取消',
        cls: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
        dot: 'bg-red-500 dark:bg-red-400',
    },
};

export function StatusBadge({ status }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <Badge className={`${config.cls} inline-flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </Badge>
    );
}
