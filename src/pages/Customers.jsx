import { useState, useEffect } from 'react';
import { Plus, Search, X, Users } from 'lucide-react';
import { useToast } from '../components/Toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Textarea, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';

function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
    const toast = useToast();

    useEffect(() => { fetchCustomers(); }, []);

    const fetchCustomers = async () => {
        try { setCustomers(await fetch('/api/customers').then(r => r.json())); }
        catch { toast.error('無法載入客戶資料'); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers';
            const res = await fetch(url, { method: editingCustomer ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
            if (!res.ok) { const d = await res.json(); toast.error(d.error || '操作失敗'); return; }
            toast.success(editingCustomer ? '客戶資料已更新' : '客戶建立成功');
            fetchCustomers(); closeModal();
        } catch { toast.error('儲存客戶資料失敗'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('確定要刪除此客戶嗎？')) return;
        try {
            const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
            if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || '操作失敗'); return; }
            toast.success('客戶已刪除'); fetchCustomers();
        } catch { toast.error('刪除客戶失敗'); }
    };

    const openModal = (customer = null) => {
        setEditingCustomer(customer);
        setFormData(customer ? { name: customer.name, email: customer.email || '', phone: customer.phone || '', address: customer.address || '' } : { name: '', email: '', phone: '', address: '' });
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditingCustomer(null); };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;

    const filtered = customers.filter(c => {
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q);
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">客戶管理</h1>
                    <p className="text-muted-foreground mt-1">管理您的客戶資料</p>
                </div>
                <Button onClick={() => openModal()}>
                    <Plus className="h-4 w-4 mr-2" />
                    新增客戶
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">總客戶數</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{customers.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Customer Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base">客戶列表</CardTitle>
                            <CardDescription>共 {filtered.length} 位客戶</CardDescription>
                        </div>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="搜尋客戶..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
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
                                                <Button variant="outline" size="sm" onClick={() => openModal(c)}>編輯</Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)}>刪除</Button>
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
                            <Button onClick={() => openModal()} className="mt-4">新增第一位客戶</Button>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-sm text-muted-foreground">找不到符合的客戶</div>
                    )}
                </CardContent>
            </Card>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
                    <div className="w-full max-w-md max-h-[90vh] overflow-auto bg-card rounded-lg border border-border shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h3 className="text-base font-semibold">{editingCustomer ? '編輯客戶' : '新增客戶'}</h3>
                            <Button variant="ghost" size="icon" onClick={closeModal} className="h-8 w-8"><X className="w-4 h-4" /></Button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="px-6 py-5 flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">客戶名稱 *</label>
                                    <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">電話</label>
                                    <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">地址</label>
                                    <Textarea className="min-h-[70px]" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
                                <Button type="button" variant="outline" onClick={closeModal}>取消</Button>
                                <Button type="submit">{editingCustomer ? '儲存變更' : '建立客戶'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Customers;
