import { useState, useEffect } from 'react';
import { Plus, X, Trash2, Package } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils';
import { useToast } from '../components/Toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Select, Textarea, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, StatusBadge } from '../components/ui';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [formData, setFormData] = useState({ customer_id: '', notes: '', items: [{ product_id: '', quantity: 1 }] });
    const toast = useToast();

    useEffect(() => { fetchData(); }, [statusFilter]);

    const fetchData = async () => {
        try {
            const [o, c, p] = await Promise.all([
                fetch(`/api/orders${statusFilter ? `?status=${statusFilter}` : ''}`).then(r => r.json()),
                fetch('/api/customers').then(r => r.json()),
                fetch('/api/products').then(r => r.json()),
            ]);
            setOrders(o); setCustomers(c); setProducts(p);
        } catch { toast.error('無法載入訂單資料'); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validItems = formData.items.filter(i => i.product_id && i.quantity > 0);
        if (!validItems.length) { toast.warning('請至少選擇一個產品'); return; }
        try {
            const res = await fetch('/api/orders', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customer_id: formData.customer_id || null, notes: formData.notes, items: validItems.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) })) })
            });
            if (!res.ok) { const d = await res.json(); toast.error(d.error || '建立訂單失敗'); return; }
            toast.success('訂單建立成功'); fetchData(); setShowModal(false);
        } catch { toast.error('建立訂單失敗'); }
    };

    const updateStatus = async (id, status) => {
        try {
            const res = await fetch(`/api/orders/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
            if (!res.ok) { const d = await res.json(); toast.error(d.error || '操作失敗'); return; }
            toast.success('訂單狀態已更新'); fetchData();
        } catch { toast.error('更新狀態失敗'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('確定要刪除此訂單嗎？')) return;
        try { await fetch(`/api/orders/${id}`, { method: 'DELETE' }); toast.success('訂單已刪除'); fetchData(); }
        catch { toast.error('刪除訂單失敗'); }
    };

    const openModal = () => { setFormData({ customer_id: '', notes: '', items: [{ product_id: '', quantity: 1 }] }); setShowModal(true); };
    const addItem = () => setFormData({ ...formData, items: [...formData.items, { product_id: '', quantity: 1 }] });
    const removeItem = (i) => { if (formData.items.length > 1) setFormData({ ...formData, items: formData.items.filter((_, idx) => idx !== i) }); };
    const updateItem = (i, field, value) => { const items = [...formData.items]; items[i][field] = value; setFormData({ ...formData, items }); };
    const total = formData.items.reduce((s, i) => { const p = products.find(x => x.id === parseInt(i.product_id)); return s + (p ? p.price * i.quantity : 0); }, 0);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;

    const filters = [
        { value: '', label: '全部' },
        { value: 'pending', label: '待處理' },
        { value: 'processing', label: '處理中' },
        { value: 'completed', label: '已完成' },
        { value: 'cancelled', label: '已取消' },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">訂單管理</h1>
                    <p className="text-muted-foreground mt-1">管理與追蹤您的訂單</p>
                </div>
                <Button onClick={openModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    新增訂單
                </Button>
            </div>

            {/* Filter Buttons */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex gap-2">
                        {filters.map(f => (
                            <Button
                                key={f.value}
                                variant={statusFilter === f.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter(f.value)}
                            >
                                {f.label}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Order Table */}
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
                                                {order.status === 'pending' && <Button variant="outline" size="sm" onClick={() => updateStatus(order.id, 'processing')}>開始處理</Button>}
                                                {order.status === 'processing' && <Button size="sm" onClick={() => updateStatus(order.id, 'completed')}>完成</Button>}
                                                {(order.status === 'pending' || order.status === 'processing') && <Button variant="destructive" size="sm" onClick={() => updateStatus(order.id, 'cancelled')}>取消</Button>}
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(order.id)} className="h-8 w-8">
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
                            <h3 className="mt-2 text-sm font-medium">{statusFilter ? '沒有符合條件的訂單' : '尚無訂單記錄'}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">點擊上方按鈕建立第一筆訂單</p>
                            <Button onClick={openModal} className="mt-4">建立第一筆訂單</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Order Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="w-full max-w-xl max-h-[90vh] overflow-auto bg-card rounded-lg border border-border shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h3 className="text-base font-semibold">新增訂單</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="h-8 w-8"><X className="w-4 h-4" /></Button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="px-6 py-5 flex flex-col gap-5">
                                <div>
                                    <label className="block text-sm font-medium mb-1">客戶</label>
                                    <Select value={formData.customer_id} onChange={e => setFormData({ ...formData, customer_id: e.target.value })}>
                                        <option value="">選擇客戶（可選）</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">訂單項目 *</label>
                                    <div className="flex flex-col gap-3">
                                        {formData.items.map((item, i) => (
                                            <div key={i} className="grid gap-3" style={{ gridTemplateColumns: '1fr 80px 80px 36px' }}>
                                                <Select value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)} required>
                                                    <option value="">選擇產品</option>
                                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>)}
                                                </Select>
                                                <Input type="number" className="text-center" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} min="1" />
                                                <div className="flex items-center text-xs font-medium text-muted-foreground">
                                                    {(() => { const p = item.product_id && products.find(x => x.id === parseInt(item.product_id)); return p ? formatCurrency(p.price * item.quantity) : '—'; })()}
                                                </div>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} disabled={formData.items.length === 1} className="h-10 w-9"><X className="w-4 h-4" /></Button>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={addItem} className="mt-3 text-xs font-medium text-primary hover:text-primary/80 bg-transparent border-none cursor-pointer">+ 新增項目</button>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">備註</label>
                                    <Textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                                </div>
                                <div className="flex items-center justify-between px-4 py-3 rounded-[var(--radius)] bg-muted">
                                    <span className="text-sm font-medium">訂單總計</span>
                                    <span className="text-lg font-bold text-primary">{formatCurrency(total)}</span>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>取消</Button>
                                <Button type="submit">建立訂單</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Orders;
