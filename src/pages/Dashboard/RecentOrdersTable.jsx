import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, StatusBadge } from '../../components/ui';

function RecentOrdersTable({ orders }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-base">近期訂單</CardTitle>
                    <CardDescription>最近的訂單記錄</CardDescription>
                </div>
                <Link to="/orders" className="text-sm text-primary hover:underline">查看全部 →</Link>
            </CardHeader>
            <CardContent>
                {orders?.length > 0 ? (
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
                            {orders.map(order => (
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
    );
}

export default RecentOrdersTable;
