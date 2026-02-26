import { useState, useEffect } from 'react';
import { formatCurrency } from '../utils';
import { useToast } from '../components/Toast';

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: ''
    });
    const toast = useToast();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            toast.error('無法載入產品資料');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingProduct
                ? `/api/products/${editingProduct.id}`
                : '/api/products';
            const method = editingProduct ? 'PUT' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price) || 0,
                    stock: parseInt(formData.stock) || 0
                })
            });

            toast.success(editingProduct ? '產品資料已更新' : '產品建立成功');
            fetchProducts();
            closeModal();
        } catch (error) {
            toast.error('儲存產品資料失敗');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('確定要刪除此產品嗎？')) return;
        try {
            await fetch(`/api/products/${id}`, { method: 'DELETE' });
            toast.success('產品已刪除');
            fetchProducts();
        } catch (error) {
            toast.error('刪除產品失敗');
        }
    };

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description || '',
                price: String(product.price),
                stock: String(product.stock)
            });
        } else {
            setEditingProduct(null);
            setFormData({ name: '', description: '', price: '', stock: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormData({ name: '', description: '', price: '', stock: '' });
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">產品管理</h1>
                <p className="page-subtitle">管理您的產品目錄與庫存</p>
            </div>

            <div className="toolbar">
                <input
                    type="text"
                    className="form-input search-input"
                    placeholder="搜尋產品名稱或描述..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button className="btn btn-primary" onClick={() => openModal()}>
                    ＋ 新增產品
                </button>
            </div>

            <div className="card">
                {(() => {
                    const filtered = products.filter((p) => {
                        const q = search.toLowerCase();
                        return p.name.toLowerCase().includes(q)
                            || (p.description || '').toLowerCase().includes(q);
                    });
                    if (filtered.length > 0) return (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>產品名稱</th>
                                    <th>描述</th>
                                    <th>價格</th>
                                    <th>庫存</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((product) => (
                                    <tr key={product.id}>
                                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                            {product.name}
                                        </td>
                                        <td>{product.description || '—'}</td>
                                        <td>{formatCurrency(product.price)}</td>
                                        <td>
                                            <span style={{
                                                color: product.stock < 10 ? 'var(--warning)' : 'inherit',
                                                fontWeight: product.stock < 10 ? 600 : 400
                                            }}>
                                                {product.stock}
                                                {product.stock < 10 && ' ⚠️'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions">
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => openModal(product)}
                                                >
                                                    編輯
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    刪除
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
                    if (products.length === 0) return (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏷️</div>
                        <p className="empty-state-text">尚無產品資料</p>
                        <button className="btn btn-primary" onClick={() => openModal()}>
                            新增第一個產品
                        </button>
                    </div>
                    );
                    return (
                    <div className="empty-state">
                        <p className="empty-state-text">找不到符合的產品</p>
                    </div>
                    );
                })()}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingProduct ? '編輯產品' : '新增產品'}
                            </h3>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">產品名稱 *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">描述</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">價格 (TWD)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            min="0"
                                            step="1"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">庫存數量</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.stock}
                                            onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    取消
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingProduct ? '儲存變更' : '建立產品'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Products;
