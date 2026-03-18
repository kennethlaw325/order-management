import { Search, Tag } from 'lucide-react';
import { formatCurrency } from '../../utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui';

const getStockStatus = (stock) => {
    if (stock < 5) return { label: '極低', dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400' };
    if (stock < 10) return { label: '偏低', dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' };
    return { label: '正常', dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' };
};

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
                                        {(() => {
                                            const stockStatus = getStockStatus(p.stock);
                                            return (
                                                <div className="flex items-center gap-2">
                                                    <span>{p.stock}</span>
                                                    <span className={`inline-flex items-center gap-1 text-xs ${stockStatus.text}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${stockStatus.dot}`} />
                                                        {stockStatus.label}
                                                    </span>
                                                </div>
                                            );
                                        })()}
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
