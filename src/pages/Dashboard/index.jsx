import { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatCards from './StatCards';
import OrderStatusCard from './OrderStatusCard';
import StockAlertCard from './StockAlertCard';
import RecentOrdersTable from './RecentOrdersTable';

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        fetch('/api/stats')
            .then(r => r.json())
            .then(setStats)
            .catch(() => toast.error('無法載入統計資料'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">儀表板</h1>
                <p className="text-muted-foreground mt-1">訂單系統總覽</p>
            </div>
            <StatCards stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <OrderStatusCard orders={stats?.orders} />
                <StockAlertCard lowStock={stats?.products?.low_stock || 0} />
            </div>
            <RecentOrdersTable orders={stats?.recentOrders} />
        </div>
    );
}

export default Dashboard;
