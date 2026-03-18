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

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">訂單管理</h1>
                    <p className="text-muted-foreground mt-1">管理與追蹤您的訂單</p>
                </div>
                <Button onClick={openModal}><Plus className="h-4 w-4 mr-2" />新增訂單</Button>
            </div>
            <OrderFilters statusFilter={statusFilter} onFilterChange={setStatusFilter} />
            <OrderTable orders={orders} onUpdateStatus={updateStatus} onDelete={handleDelete} onCreateClick={openModal} />
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
        </div>
    );
}

export default Orders;
