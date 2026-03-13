import { useState, useEffect } from 'react';
import { Plus, X, Trash2, Filter, Eye, MoreVertical, Package } from 'lucide-react';
import { formatCurrency, getStatusLabel, formatDate } from '../utils';
import { useToast } from '../components/Toast';

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

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin" /></div>;

    return (
        <div>
            {/* Page Header */}
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">訂單管理</h1>
                    <p className="mt-1 text-sm text-gray-500">管理與追蹤您的訂單</p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-3">
                    <select
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="">全部狀態</option>
                        <option value="pending">待處理</option>
                        <option value="processing">處理中</option>
                        <option value="completed">已完成</option>
                        <option value="cancelled">已取消</option>
                    </select>
                    <button onClick={openModal} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                        <Plus className="h-4 w-4 mr-2" />
                        新增訂單
                    </button>
                </div>
            </div>

            {/* Order Table */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                {orders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['訂單編號', '客戶', '金額', '狀態', '建立時間', '操作'].map(h => (
                                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">#{String(order.id).padStart(4, '0')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer_name || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(order.total)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.created_at)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {order.status === 'pending' && <ActionBtn onClick={() => updateStatus(order.id, 'processing')}>開始處理</ActionBtn>}
                                                {order.status === 'processing' && <ActionBtn primary onClick={() => updateStatus(order.id, 'completed')}>完成</ActionBtn>}
                                                {(order.status === 'pending' || order.status === 'processing') && <ActionBtn danger onClick={() => updateStatus(order.id, 'cancelled')}>取消</ActionBtn>}
                                                <button onClick={() => handleDelete(order.id)} className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">{statusFilter ? '沒有符合條件的訂單' : '尚無訂單記錄'}</h3>
                        <p className="mt-1 text-sm text-gray-500">點擊上方按鈕建立第一筆訂單</p>
                        <button onClick={openModal} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                            建立第一筆訂單
                        </button>
                    </div>
                )}
            </div>

            {/* Create Order Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="w-full max-w-xl max-h-[90vh] overflow-auto bg-white rounded-lg border border-gray-200 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h3 className="text-base font-semibold text-gray-900">新增訂單</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="px-6 py-5 flex flex-col gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">客戶</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" value={formData.customer_id} onChange={e => setFormData({ ...formData, customer_id: e.target.value })}>
                                        <option value="">選擇客戶（可選）</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">訂單項目 *</label>
                                    <div className="flex flex-col gap-3">
                                        {formData.items.map((item, i) => (
                                            <div key={i} className="grid gap-3" style={{ gridTemplateColumns: '1fr 80px 80px 36px' }}>
                                                <select className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)} required>
                                                    <option value="">選擇產品</option>
                                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>)}
                                                </select>
                                                <input type="number" className="px-3 py-2 border border-gray-300 rounded-md text-sm text-center bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} min="1" />
                                                <div className="flex items-center text-xs font-medium text-gray-500">
                                                    {item.product_id && products.find(p => p.id === parseInt(item.product_id)) ? formatCurrency(products.find(p => p.id === parseInt(item.product_id)).price * item.quantity) : '—'}
                                                </div>
                                                <button type="button" onClick={() => removeItem(i)} disabled={formData.items.length === 1} className="p-2 rounded-md text-gray-400 hover:text-gray-600 disabled:opacity-30 bg-transparent border-none"><X className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={addItem} className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-transparent border-none cursor-pointer">+ 新增項目</button>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
                                    <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-y bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" style={{ minHeight: '60px' }} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                                </div>
                                <div className="flex items-center justify-between px-4 py-3 rounded-md bg-gray-50">
                                    <span className="text-sm font-medium text-gray-700">訂單總計</span>
                                    <span className="text-lg font-bold text-indigo-600">{formatCurrency(total)}</span>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">取消</button>
                                <button type="submit" className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">建立訂單</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        processing: 'bg-blue-100 text-blue-800 border-blue-200',
        completed: 'bg-green-100 text-green-800 border-green-200',
        cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    const labels = { pending: '待處理', processing: '處理中', completed: '已完成', cancelled: '已取消' };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
            {labels[status] || status}
        </span>
    );
}

function ActionBtn({ children, onClick, primary, danger }) {
    const cls = primary
        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
        : danger
        ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300';
    return <button onClick={onClick} className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${cls}`}>{children}</button>;
}

export default Orders;
