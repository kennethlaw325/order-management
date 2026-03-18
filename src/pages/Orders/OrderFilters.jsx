import { Search } from 'lucide-react';

const STATUS_TABS = [
    { value: '', label: '全部' },
    { value: 'pending', label: '待處理' },
    { value: 'processing', label: '處理中' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
];

function OrderFilters({ statusFilter, onFilterChange, search, onSearchChange, orders = [] }) {
    const getCount = (status) => status ? orders.filter(o => o.status === status).length : orders.length;

    return (
        <div className="space-y-3">
            {/* Pill tabs */}
            <div className="flex flex-wrap gap-2">
                {STATUS_TABS.map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => onFilterChange(value)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 cursor-pointer ${
                            statusFilter === value
                                ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                        }`}
                    >
                        {label}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            statusFilter === value
                                ? 'bg-white/20 text-white'
                                : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                        }`}>
                            {getCount(value)}
                        </span>
                    </button>
                ))}
            </div>
            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    placeholder="搜尋客戶名稱或訂單編號..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-[var(--radius)] bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>
        </div>
    );
}

export default OrderFilters;
