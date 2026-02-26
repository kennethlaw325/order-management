import { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';

function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const toast = useToast();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/customers');
            const data = await res.json();
            setCustomers(data);
        } catch (error) {
            toast.error('無法載入客戶資料');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingCustomer
                ? `/api/customers/${editingCustomer.id}`
                : '/api/customers';
            const method = editingCustomer ? 'PUT' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            toast.success(editingCustomer ? '客戶資料已更新' : '客戶建立成功');
            fetchCustomers();
            closeModal();
        } catch (error) {
            toast.error('儲存客戶資料失敗');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('確定要刪除此客戶嗎？')) return;
        try {
            await fetch(`/api/customers/${id}`, { method: 'DELETE' });
            toast.success('客戶已刪除');
            fetchCustomers();
        } catch (error) {
            toast.error('刪除客戶失敗');
        }
    };

    const openModal = (customer = null) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({
                name: customer.name,
                email: customer.email || '',
                phone: customer.phone || '',
                address: customer.address || ''
            });
        } else {
            setEditingCustomer(null);
            setFormData({ name: '', email: '', phone: '', address: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCustomer(null);
        setFormData({ name: '', email: '', phone: '', address: '' });
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">客戶管理</h1>
                <p className="page-subtitle">管理您的客戶資料</p>
            </div>

            <div className="toolbar">
                <input
                    type="text"
                    className="form-input search-input"
                    placeholder="搜尋客戶名稱、Email 或電話..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button className="btn btn-primary" onClick={() => openModal()}>
                    ＋ 新增客戶
                </button>
            </div>

            <div className="card">
                {(() => {
                    const filtered = customers.filter((c) => {
                        const q = search.toLowerCase();
                        return c.name.toLowerCase().includes(q)
                            || (c.email || '').toLowerCase().includes(q)
                            || (c.phone || '').toLowerCase().includes(q);
                    });
                    if (filtered.length > 0) return (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>客戶名稱</th>
                                    <th>Email</th>
                                    <th>電話</th>
                                    <th>地址</th>
                                    <th>訂單數</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((customer) => (
                                    <tr key={customer.id}>
                                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                            {customer.name}
                                        </td>
                                        <td>{customer.email || '—'}</td>
                                        <td>{customer.phone || '—'}</td>
                                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {customer.address || '—'}
                                        </td>
                                        <td>{customer.order_count || 0}</td>
                                        <td>
                                            <div className="actions">
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => openModal(customer)}
                                                >
                                                    編輯
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDelete(customer.id)}
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
                    if (customers.length === 0) return (
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <p className="empty-state-text">尚無客戶資料</p>
                        <button className="btn btn-primary" onClick={() => openModal()}>
                            新增第一位客戶
                        </button>
                    </div>
                    );
                    return (
                    <div className="empty-state">
                        <p className="empty-state-text">找不到符合的客戶</p>
                    </div>
                    );
                })()}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingCustomer ? '編輯客戶' : '新增客戶'}
                            </h3>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">客戶名稱 *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">電話</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">地址</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        style={{ minHeight: '80px' }}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    取消
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingCustomer ? '儲存變更' : '建立客戶'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Customers;
