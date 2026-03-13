import { useState, useEffect } from 'react';
import { Plus, Search, X, Tag, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils';
import { useToast } from '../components/Toast';

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

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin" /></div>;

    const filtered = products.filter(p => {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
    });

    return (
        <div>
            {/* Page Header */}
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">產品管理</h1>
                    <p className="mt-1 text-sm text-gray-500">管理您的產品目錄與庫存</p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                            placeholder="搜尋產品..."
                            value={search} onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button onClick={() => openModal()} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                        <Plus className="h-4 w-4 mr-2" />
                        新增產品
                    </button>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                {filtered.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['產品名稱', '描述', '價格', '庫存', '操作'].map(h => (
                                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filtered.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-[250px] truncate">{p.description || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(p.price)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {p.stock < 10 ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                    <AlertTriangle className="w-3.5 h-3.5" /> {p.stock}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">{p.stock}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openModal(p)} className="px-3 py-1.5 rounded-md text-xs font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors">編輯</button>
                                                <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors">刪除</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12">
                        <Tag className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">尚無產品資料</h3>
                        <p className="mt-1 text-sm text-gray-500">點擊上方按鈕新增第一個產品</p>
                        <button onClick={() => openModal()} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                            新增第一個產品
                        </button>
                    </div>
                ) : (
                    <div className="py-12 text-center text-sm text-gray-500">找不到符合的產品</div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
                    <div className="w-full max-w-md max-h-[90vh] overflow-auto bg-white rounded-lg border border-gray-200 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h3 className="text-base font-semibold text-gray-900">{editingProduct ? '編輯產品' : '新增產品'}</h3>
                            <button onClick={closeModal} className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="px-6 py-5 flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">產品名稱 *</label>
                                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                                    <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-y bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" style={{ minHeight: '80px' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">價格 (TWD)</label>
                                        <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} min="0" step="1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">庫存數量</label>
                                        <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} min="0" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">取消</button>
                                <button type="submit" className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">{editingProduct ? '儲存變更' : '建立產品'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Products;
