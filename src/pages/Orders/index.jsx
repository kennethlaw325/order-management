import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { Button } from '../../components/ui';
import LoadingSpinner from '../../components/LoadingSpinner';
import OrderFilters from './OrderFilters';
import OrderTable from './OrderTable';
import CreateOrderModal from './CreateOrderModal';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
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

    const handleDelete = (id) => setDeleteConfirm(id);

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await fetch(`/api/orders/${deleteConfirm}`, { method: 'DELETE' });
            toast.success('訂單已刪除');
            fetchData();
        } catch { toast.error('刪除訂單失敗'); }
        finally { setDeleteConfirm(null); }
    };

    const openModal = () => { setFormData({ customer_id: '', notes: '', items: [{ product_id: '', quantity: 1 }] }); setShowModal(true); };
    const addItem = () => setFormData({ ...formData, items: [...formData.items, { product_id: '', quantity: 1 }] });
    const removeItem = (i) => { if (formData.items.length > 1) setFormData({ ...formData, items: formData.items.filter((_, idx) => idx !== i) }); };
    const updateItem = (i, field, value) => { const items = [...formData.items]; items[i][field] = value; setFormData({ ...formData, items }); };

    const filteredOrders = orders.filter(o => {
        if (!search) return true;
        const q = search.toLowerCase();
        return o.customer_name?.toLowerCase().includes(q) || String(o.id).padStart(4, '0').includes(q);
    });

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={openModal}><Plus className="h-4 w-4 mr-2" />新增訂單</Button>
            </div>
            <OrderFilters
                statusFilter={statusFilter}
                onFilterChange={(status) => { setStatusFilter(status); setSearch(''); }}
                search={search}
                onSearchChange={setSearch}
                orders={orders}
            />
            <OrderTable orders={filteredOrders} onUpdateStatus={updateStatus} onDelete={handleDelete} onCreateClick={openModal} />
            {showModal && (
                <CreateOrderModal
                    formData={formData}
                    setFormData={setFormData}
                    customers={customers}
                    products={products}
                    onSubmit={handleSubmit}
                    onClose={() => setShowModal(false)}
                    onAddItem={addItem}
                    onRemoveItem={removeItem}
                    onUpdateItem={updateItem}
                />
            )}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center flex-shrink-0">
                                <span className="text-red-500 text-lg">!</span>
                            </div>
                            <div>
                                <h3 className="font-semibold">確定要刪除訂單？</h3>
                                <p className="text-sm text-muted-foreground mt-0.5">此操作無法復原。</p>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm rounded-[var(--radius)] border border-input hover:bg-accent transition-colors cursor-pointer">取消</button>
                            <button onClick={confirmDelete} className="px-4 py-2 text-sm rounded-[var(--radius)] bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors cursor-pointer">確認刪除</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Orders;
