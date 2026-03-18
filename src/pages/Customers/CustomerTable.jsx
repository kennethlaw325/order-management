import { Search, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui';

function CustomerTable({ customers, search, onSearchChange, onEdit, onDelete, onCreateClick }) {
    const filtered = customers.filter(c => {
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q);
    });

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base">客戶列表</CardTitle>
                        <CardDescription>共 {filtered.length} 位客戶</CardDescription>
                    </div>
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="搜尋客戶..." value={search} onChange={e => onSearchChange(e.target.value)} className="pl-10" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {filtered.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>客戶名稱</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>電話</TableHead>
                                <TableHead>地址</TableHead>
                                <TableHead>訂單數</TableHead>
                                <TableHead>操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map(c => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{c.email || '—'}</TableCell>
                                    <TableCell className="text-muted-foreground">{c.phone || '—'}</TableCell>
                                    <TableCell className="text-muted-foreground max-w-[200px] truncate">{c.address || '—'}</TableCell>
                                    <TableCell className="text-muted-foreground">{c.order_count || 0}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" onClick={() => onEdit(c)}>編輯</Button>
                                            <Button variant="destructive" size="sm" onClick={() => onDelete(c.id)}>刪除</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : customers.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-2 text-sm font-medium">尚無客戶資料</h3>
                        <p className="mt-1 text-sm text-muted-foreground">點擊上方按鈕新增第一位客戶</p>
                        <Button onClick={onCreateClick} className="mt-4">新增第一位客戶</Button>
                    </div>
                ) : (
                    <div className="py-12 text-center text-sm text-muted-foreground">找不到符合的客戶</div>
                )}
            </CardContent>
        </Card>
    );
}

export default CustomerTable;
