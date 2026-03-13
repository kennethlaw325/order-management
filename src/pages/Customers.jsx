import { useState, useEffect } from 'react';
import { Plus, Search, X, Users } from 'lucide-react';
import { useToast } from '../components/Toast';

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

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin" /></div>;

    const filtered = customers.filter(c => {
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q);
    });

    return (
        <div>
            {/* Page Header */}
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">客戶管理</h1>
                    <p className="mt-1 text-sm text-gray-500">管理您的客戶資料</p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                            placeholder="搜尋客戶..."
                            value={search} onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button onClick={() => openModal()} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                        <Plus className="h-4 w-4 mr-2" />
                        新增客戶
                    </button>
                </div>
            </div>

            {/* Customer Table */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                {filtered.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['客戶名稱', 'Email', '電話', '地址', '訂單數', '操作'].map(h => (
                                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filtered.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.email || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.phone || '—'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">{c.address || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.order_count || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openModal(c)} className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors">編輯</button>
                                                <button onClick={() => handleDelete(c.id)} className="px-3 py-1.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors">刪除</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : customers.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">尚無客戶資料</h3>
                        <p className="mt-1 text-sm text-gray-500">點擊上方按鈕新增第一位客戶</p>
                        <button onClick={() => openModal()} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                            新增第一位客戶
                        </button>
                    </div>
                ) : (
                    <div className="py-12 text-center text-sm text-gray-500">找不到符合的客戶</div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
                    <div className="w-full max-w-md max-h-[90vh] overflow-auto bg-white rounded-lg border border-gray-200 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h3 className="text-base font-semibold text-gray-900">{editingCustomer ? '編輯客戶' : '新增客戶'}</h3>
                            <button onClick={closeModal} className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="px-6 py-5 flex flex-col gap-4">
                                {[
                                    { key: 'name', label: '客戶名稱 *', type: 'text', required: true },
                                    { key: 'email', label: 'Email', type: 'email' },
                                    { key: 'phone', label: '電話', type: 'text' },
                                ].map(({ key, label, type, required }) => (
                                    <div key={key}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                                        <input type={type} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} required={required} />
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
                                    <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-y bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" style={{ minHeight: '70px' }} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">取消</button>
                                <button type="submit" className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">{editingCustomer ? '儲存變更' : '建立客戶'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Customers;
