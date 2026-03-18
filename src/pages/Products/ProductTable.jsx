import { Search, Tag, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui';

function ProductTable({ products, search, onSearchChange, onEdit, onDelete, onCreateClick }) {
    const filtered = products.filter(p => {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
    });

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base">產品列表</CardTitle>
                        <CardDescription>共 {filtered.length} 個產品</CardDescription>
                    </div>
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="搜尋產品..." value={search} onChange={e => onSearchChange(e.target.value)} className="pl-10" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {filtered.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>產品名稱</TableHead>
                                <TableHead>描述</TableHead>
                                <TableHead>價格</TableHead>
                                <TableHead>庫存</TableHead>
                                <TableHead>操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.name}</TableCell>
                                    <TableCell className="text-muted-foreground max-w-[250px] truncate">{p.description || '—'}</TableCell>
                                    <TableCell className="font-medium">{formatCurrency(p.price)}</TableCell>
                                    <TableCell>
                                        {p.stock < 10 ? (
                                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                                <AlertTriangle className="w-3 h-3 mr-1" /> {p.stock}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">{p.stock}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" onClick={() => onEdit(p)}>編輯</Button>
                                            <Button variant="destructive" size="sm" onClick={() => onDelete(p.id)}>刪除</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : products.length === 0 ? (
                    <div className="text-center py-12">
                        <Tag className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-2 text-sm font-medium">尚無產品資料</h3>
                        <p className="mt-1 text-sm text-muted-foreground">點擊上方按鈕新增第一個產品</p>
                        <Button onClick={onCreateClick} className="mt-4">新增第一個產品</Button>
                    </div>
                ) : (
                    <div className="py-12 text-center text-sm text-muted-foreground">找不到符合的產品</div>
                )}
            </CardContent>
        </Card>
    );
}

export default ProductTable;
