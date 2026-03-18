// src/pages/Dashboard/OrderStatusCard.jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui';

const STATUS_BARS = [
    { key: 'pending', label: '待處理', color: 'bg-amber-500' },
    { key: 'processing', label: '處理中', color: 'bg-blue-500' },
    { key: 'completed', label: '已完成', color: 'bg-emerald-500' },
    { key: 'cancelled', label: '已取消', color: 'bg-red-400' },
];

function OrderStatusCard({ orders }) {
    const total = orders?.total || 0;
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">訂單狀態分佈</CardTitle>
                <CardDescription>共 {total} 筆訂單</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {STATUS_BARS.map(({ key, label, color }) => {
                    const count = orders?.[key] || 0;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                        <div key={key}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">{label}</span>
                                <span className="font-medium">{count} <span className="text-muted-foreground text-xs">({pct}%)</span></span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${color} rounded-full transition-all duration-700`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

export default OrderStatusCard;
