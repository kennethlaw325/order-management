import { Trash2, Package } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, StatusBadge } from '../../components/ui';

function OrderTable({ orders, onUpdateStatus, onDelete, onCreateClick }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">訂單列表</CardTitle>
                <CardDescription>共 {orders.length} 筆訂單</CardDescription>
            </CardHeader>
            <CardContent>
                {orders.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>訂單編號</TableHead>
                                <TableHead>客戶</TableHead>
                                <TableHead>金額</TableHead>
                                <TableHead>狀態</TableHead>
                                <TableHead>建立時間</TableHead>
                                <TableHead>操作</TableHead>
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
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {order.status === 'pending' && <Button variant="outline" size="sm" onClick={() => onUpdateStatus(order.id, 'processing')}>開始處理</Button>}
                                            {order.status === 'processing' && <Button size="sm" onClick={() => onUpdateStatus(order.id, 'completed')}>完成</Button>}
                                            {(order.status === 'pending' || order.status === 'processing') && <Button variant="destructive" size="sm" onClick={() => onUpdateStatus(order.id, 'cancelled')}>取消</Button>}
                                            <Button variant="ghost" size="icon" onClick={() => onDelete(order.id)} className="h-8 w-8">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-2 text-sm font-medium">尚無訂單記錄</h3>
                        <p className="mt-1 text-sm text-muted-foreground">點擊上方按鈕建立第一筆訂單</p>
                        <Button onClick={onCreateClick} className="mt-4">建立第一筆訂單</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default OrderTable;
