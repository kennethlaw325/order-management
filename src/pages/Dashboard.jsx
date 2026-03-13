import { useState, useEffect } from 'react';
import { Package, DollarSign, Users, Tag, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, getStatusLabel, formatDate } from '../utils';
import { useToast } from '../components/Toast';

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

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin" /></div>;
    }

    const statCards = [
        { label: '總訂單數', value: stats?.orders?.total || 0, icon: Package, trend: '+12.5%', positive: true },
        { label: '總收入（已完成）', value: formatCurrency(stats?.revenue || 0), icon: DollarSign, trend: '+8.2%', positive: true },
        { label: '客戶數', value: stats?.customers || 0, icon: Users, trend: '+5.1%', positive: true },
        { label: '產品數', value: stats?.products?.total || 0, icon: Tag, trend: '-2.1%', positive: false },
    ];

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">儀表板</h1>
                <p className="mt-1 text-sm text-gray-500">訂單系統總覽</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {statCards.map(({ label, value, trend, positive }) => (
                    <div key={label} className="bg-white overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                        <div className="p-5">
                            <p className="text-sm font-medium text-gray-500 truncate">{label}</p>
                            <div className="mt-1 flex items-baseline">
                                <p className="text-2xl font-semibold text-gray-900">{value}</p>
                                <p className={`ml-2 flex items-baseline text-sm font-semibold ${positive ? 'text-green-600' : 'text-red-600'}`}>
                                    {positive ? <ArrowUpRight className="h-4 w-4 mr-0.5" /> : <ArrowDownRight className="h-4 w-4 mr-0.5" />}
                                    {trend}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                {/* Order Status */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">訂單狀態</h2>
                    <div className="flex flex-col gap-3">
                        {[
                            { status: 'pending', label: '待處理' },
                            { status: 'processing', label: '處理中' },
                            { status: 'completed', label: '已完成' },
                            { status: 'cancelled', label: '已取消' },
                        ].map(({ status, label }) => (
                            <div key={status} className="flex items-center justify-between">
                                <StatusBadge status={status} />
                                <span className="text-sm font-semibold text-gray-900">{stats?.orders?.[status] || 0}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stock Alert */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">庫存警示</h2>
                    {stats?.products?.low_stock > 0 ? (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                            <div>
                                <div className="text-sm font-semibold text-yellow-800">{stats.products.low_stock} 件商品庫存不足</div>
                                <div className="text-xs text-yellow-600">庫存低於 10 件</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-sm text-gray-500">所有商品庫存充足</div>
                    )}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200">
                    <h2 className="text-sm font-semibold text-gray-900">近期訂單</h2>
                </div>
                {stats?.recentOrders?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['訂單編號', '客戶', '金額', '狀態', '時間'].map(h => (
                                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {stats.recentOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">#{String(order.id).padStart(4, '0')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer_name || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(order.total)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center text-sm text-gray-500">尚無訂單記錄</div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        processing: 'bg-blue-100 text-blue-800 border-blue-200',
        completed: 'bg-green-100 text-green-800 border-green-200',
        cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    const labels = { pending: '待處理', processing: '處理中', completed: '已完成', cancelled: '已取消' };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
            {labels[status] || status}
        </span>
    );
}

export default Dashboard;
