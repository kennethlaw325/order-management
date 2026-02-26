import { useState, useEffect } from 'react';
import { formatCurrency, getStatusLabel, formatDate } from '../utils';
import { useToast } from '../components/Toast';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [formData, setFormData] = useState({
        customer_id: '',
        notes: '',
        items: [{ product_id: '', quantity: 1 }]
    });
    const toast = useToast();

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    const fetchData = async () => {
        try {
            const [ordersRes, customersRes, productsRes] = await Promise.all([
                fetch(`/api/orders${statusFilter ? `?status=${statusFilter}` : ''}`),
                fetch('/api/customers'),
                fetch('/api/products')
            ]);

            setOrders(await ordersRes.json());
            setCustomers(await customersRes.json());
            setProducts(await productsRes.json());
        } catch (error) {
            toast.error('無法載入訂單資料');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validItems = formData.items.filter(item => item.product_id && item.quantity > 0);
        if (validItems.length === 0) {
            toast.warning('請至少選擇一個產品');
            return;
        }

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: formData.customer_id || null,
                    notes: formData.notes,
                    items: validItems.map(item => ({
                        product_id: parseInt(item.product_id),
                        quantity: parseInt(item.quantity)
                    }))
                })
            });

            if (!res.ok) {
                const data = await res.json();
                toast.error(data.error || '建立訂單失敗');
                return;
            }

            toast.success('訂單建立成功');
            fetchData();
            closeModal();
        } catch (error) {
            toast.error('建立訂單失敗');
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await fetch(`/api/orders/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            toast.success('訂單狀態已更新');
            fetchData();
        } catch (error) {
            toast.error('更新狀態失敗');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('確定要刪除此訂單嗎？')) return;
        try {
            await fetch(`/api/orders/${id}`, { method: 'DELETE' });
            toast.success('訂單已刪除');
            fetchData();
        } catch (error) {
            toast.error('刪除訂單失敗');
        }
    };

    const openModal = () => {
        setFormData({
            customer_id: '',
            notes: '',
            items: [{ product_id: '', quantity: 1 }]
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { product_id: '', quantity: 1 }]
        });
    };

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            setFormData({
                ...formData,
                items: formData.items.filter((_, i) => i !== index)
            });
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => {
            const product = products.find(p => p.id === parseInt(item.product_id));
            return sum + (product ? product.price * item.quantity : 0);
        }, 0);
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">訂單管理</h1>
                <p className="page-subtitle">管理與追蹤您的訂單</p>
            </div>

            <div className="toolbar">
                <button className="btn btn-primary" onClick={openModal}>
                    ＋ 新增訂單
                </button>
                <select
                    className="form-select"
                    style={{ width: 'auto' }}
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                >
                    <option value="">全部狀態</option>
                    <option value="pending">待處理</option>
                    <option value="processing">處理中</option>
                    <option value="completed">已完成</option>
                    <option value="cancelled">已取消</option>
                </select>
            </div>

            <div className="card">
                {orders.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>訂單編號</th>
                                    <th>客戶</th>
                                    <th>金額</th>
                                    <th>狀態</th>
                                    <th>建立時間</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                            #{String(order.id).padStart(4, '0')}
                                        </td>
                                        <td>{order.customer_name || '—'}</td>
                                        <td>{formatCurrency(order.total)}</td>
                                        <td>
                                            <span className={`status-badge ${order.status}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </td>
                                        <td className="text-muted">{formatDate(order.created_at)}</td>
                                        <td>
                                            <div className="actions">
                                                {order.status === 'pending' && (
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => updateStatus(order.id, 'processing')}
                                                    >
                                                        開始處理
                                                    </button>
                                                )}
                                                {order.status === 'processing' && (
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => updateStatus(order.id, 'completed')}
                                                    >
                                                        完成
                                                    </button>
                                                )}
                                                {(order.status === 'pending' || order.status === 'processing') && (
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => updateStatus(order.id, 'cancelled')}
                                                    >
                                                        取消
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDelete(order.id)}
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
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <p className="empty-state-text">
                            {statusFilter ? '沒有符合條件的訂單' : '尚無訂單記錄'}
                        </p>
                        <button className="btn btn-primary" onClick={openModal}>
                            建立第一筆訂單
                        </button>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">新增訂單</h3>
                            <button className="modal-close" onClick={closeModal}>x</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">客戶</label>
                                    <select
                                        className="form-select"
                                        value={formData.customer_id}
                                        onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                                    >
                                        <option value="">選擇客戶（可選）</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">訂單項目 *</label>
                                    <div className="order-items-list">
                                        {formData.items.map((item, index) => (
                                            <div key={index} className="order-item-row">
                                                <div className="form-group">
                                                    <select
                                                        className="form-select"
                                                        value={item.product_id}
                                                        onChange={e => updateItem(index, 'product_id', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">選擇產品</option>
                                                        {products.map(p => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.name} - {formatCurrency(p.price)} (庫存: {p.stock})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        value={item.quantity}
                                                        onChange={e => updateItem(index, 'quantity', e.target.value)}
                                                        min="1"
                                                        placeholder="數量"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                                                        {item.product_id && products.find(p => p.id === parseInt(item.product_id))
                                                            ? formatCurrency(products.find(p => p.id === parseInt(item.product_id)).price * item.quantity)
                                                            : '—'
                                                        }
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => removeItem(index)}
                                                    disabled={formData.items.length === 1}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
                                        ＋ 新增項目
                                    </button>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">備註</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        style={{ minHeight: '60px' }}
                                    />
                                </div>

                                <div style={{
                                    padding: '16px',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontWeight: 500 }}>訂單總計</span>
                                    <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent)' }}>
                                        {formatCurrency(calculateTotal())}
                                    </span>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    取消
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    建立訂單
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Orders;
