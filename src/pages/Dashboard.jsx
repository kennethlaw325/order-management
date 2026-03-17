import { useState, useEffect } from 'react';
import { Package, DollarSign, Users, Tag, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils';
import { useToast } from '../components/Toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, StatusBadge } from '../components/ui';

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
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;
    }

    const statCards = [
        { label: '總訂單數', value: stats?.orders?.total || 0, icon: Package, trend: '+12.5%', positive: true },
        { label: '總收入（已完成）', value: formatCurrency(stats?.revenue || 0), icon: DollarSign, trend: '+8.2%', positive: true },
        { label: '客戶數', value: stats?.customers || 0, icon: Users, trend: '+5.1%', positive: true },
        { label: '產品數', value: stats?.products?.total || 0, icon: Tag, trend: '-2.1%', positive: false },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">儀表板</h1>
                <p className="text-muted-foreground mt-1">訂單系統總覽</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map(({ label, value, icon: Icon, trend, positive }) => (
                    <Card key={label}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{label}</CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{value}</div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                {positive
                                    ? <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                                    : <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                                }
                                <span className={positive ? 'text-green-500' : 'text-red-500'}>{trend}</span>
                                <span className="ml-1">較上週</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Body Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">訂單狀態</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-3">
                            {[
                                { status: 'pending', label: '待處理', cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
                                { status: 'processing', label: '處理中', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
                                { status: 'completed', label: '已完成', cls: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
                                { status: 'cancelled', label: '已取消', cls: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
                            ].map(({ status, label, cls }) => (
                                <div key={status} className="flex items-center justify-between">
                                    <Badge className={cls}>{label}</Badge>
                                    <span className="text-sm font-semibold">{stats?.orders?.[status] || 0}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Stock Alert */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            庫存警示
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats?.products?.low_stock > 0 ? (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <div>
                                    <div className="text-sm font-semibold">{stats.products.low_stock} 件商品庫存不足</div>
                                    <div className="text-xs text-muted-foreground">庫存低於 10 件</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-sm text-muted-foreground">所有商品庫存充足</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">近期訂單</CardTitle>
                    <CardDescription>最近的訂單記錄</CardDescription>
                </CardHeader>
                <CardContent>
                    {stats?.recentOrders?.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>訂單編號</TableHead>
                                    <TableHead>客戶</TableHead>
                                    <TableHead>金額</TableHead>
                                    <TableHead>狀態</TableHead>
                                    <TableHead>時間</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.recentOrders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium text-primary">#{String(order.id).padStart(4, '0')}</TableCell>
                                        <TableCell className="text-muted-foreground">{order.customer_name || '—'}</TableCell>
                                        <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                                        <TableCell><StatusBadge status={order.status} /></TableCell>
                                        <TableCell className="text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="py-12 text-center text-sm text-muted-foreground">尚無訂單記錄</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default Dashboard;
