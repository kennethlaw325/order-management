import { Card, CardHeader, CardTitle, CardContent, Badge } from '../../components/ui';

const STATUS_LIST = [
    { status: 'pending', label: '待處理', cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    { status: 'processing', label: '處理中', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    { status: 'completed', label: '已完成', cls: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    { status: 'cancelled', label: '已取消', cls: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
];

function OrderStatusCard({ orders }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">訂單狀態</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-3">
                    {STATUS_LIST.map(({ status, label, cls }) => (
                        <div key={status} className="flex items-center justify-between">
                            <Badge className={cls}>{label}</Badge>
                            <span className="text-sm font-semibold">{orders?.[status] || 0}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default OrderStatusCard;
