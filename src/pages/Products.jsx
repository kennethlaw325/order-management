import { useState, useEffect } from 'react';
import { Plus, Search, X, Tag, AlertTriangle, Package } from 'lucide-react';
import { formatCurrency } from '../utils';
import { useToast } from '../components/Toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Input, Textarea, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '' });
    const toast = useToast();

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try { setProducts(await fetch('/api/products').then(r => r.json())); }
        catch { toast.error('無法載入產品資料'); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
            const res = await fetch(url, { method: editingProduct ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, price: parseFloat(formData.price) || 0, stock: parseInt(formData.stock) || 0 }) });
            if (!res.ok) { const d = await res.json(); toast.error(d.error || '操作失敗'); return; }
            toast.success(editingProduct ? '產品資料已更新' : '產品建立成功');
            fetchProducts(); closeModal();
        } catch { toast.error('儲存產品資料失敗'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('確定要刪除此產品嗎？')) return;
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || '操作失敗'); return; }
            toast.success('產品已刪除'); fetchProducts();
        } catch { toast.error('刪除產品失敗'); }
    };

    const openModal = (product = null) => {
        setEditingProduct(product);
        setFormData(product ? { name: product.name, description: product.description || '', price: String(product.price), stock: String(product.stock) } : { name: '', description: '', price: '', stock: '' });
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditingProduct(null); };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;

    const filtered = products.filter(p => {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
    });

    const lowStockCount = products.filter(p => p.stock < 10).length;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">產品管理</h1>
                    <p className="text-muted-foreground mt-1">管理您的產品目錄與庫存</p>
                </div>
                <Button onClick={() => openModal()}>
                    <Plus className="h-4 w-4 mr-2" />
                    新增產品
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">總產品數</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{products.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">低庫存商品</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Product Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base">產品列表</CardTitle>
                            <CardDescription>共 {filtered.length} 個產品</CardDescription>
                        </div>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="搜尋產品..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
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
                                                <Button variant="outline" size="sm" onClick={() => openModal(p)}>編輯</Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>刪除</Button>
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
                            <Button onClick={() => openModal()} className="mt-4">新增第一個產品</Button>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-sm text-muted-foreground">找不到符合的產品</div>
                    )}
                </CardContent>
            </Card>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
                    <div className="w-full max-w-md max-h-[90vh] overflow-auto bg-card rounded-lg border border-border shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h3 className="text-base font-semibold">{editingProduct ? '編輯產品' : '新增產品'}</h3>
                            <Button variant="ghost" size="icon" onClick={closeModal} className="h-8 w-8"><X className="w-4 h-4" /></Button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="px-6 py-5 flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">產品名稱 *</label>
                                    <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">描述</label>
                                    <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">價格 (TWD)</label>
                                        <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} min="0" step="1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">庫存數量</label>
                                        <Input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} min="0" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
                                <Button type="button" variant="outline" onClick={closeModal}>取消</Button>
                                <Button type="submit">{editingProduct ? '儲存變更' : '建立產品'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Products;
