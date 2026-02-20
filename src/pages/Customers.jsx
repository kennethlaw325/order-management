import { useState, useEffect, useMemo } from 'react';

function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerDetail, setCustomerDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [filterBy, setFilterBy] = useState('all');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchCustomers(), 300);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchCustomers = async () => {
        try {
            const params = search ? `?search=${encodeURIComponent(search)}` : '';
            const res = await fetch(`/api/customers${params}`);
            const data = await res.json();
            setCustomers(data);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerDetail = async (id) => {
        setDetailLoading(true);
        try {
            const res = await fetch(`/api/customers/${id}`);
            const data = await res.json();
            setCustomerDetail(data);
        } catch (error) {
            console.error('Failed to fetch customer detail:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    // Client-side sort + filter
    const processedCustomers = useMemo(() => {
        let result = [...customers];

        // Filter
        if (filterBy === 'has_orders') {
            result = result.filter(c => c.order_count > 0);
        } else if (filterBy === 'no_orders') {
            result = result.filter(c => c.order_count === 0);
        } else if (filterBy === 'high_value') {
            result = result.filter(c => c.total_spent >= 10000);
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'name_asc':
                    return a.name.localeCompare(b.name, 'zh-TW');
                case 'name_desc':
                    return b.name.localeCompare(a.name, 'zh-TW');
                case 'orders_desc':
                    return (b.order_count || 0) - (a.order_count || 0);
                case 'orders_asc':
                    return (a.order_count || 0) - (b.order_count || 0);
                case 'spent_desc':
                    return (b.total_spent || 0) - (a.total_spent || 0);
                case 'spent_asc':
                    return (a.total_spent || 0) - (b.total_spent || 0);
                case 'oldest':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'newest':
                default:
                    return new Date(b.created_at) - new Date(a.created_at);
            }
        });

        return result;
    }, [customers, sortBy, filterBy]);

    const handleSelectCustomer = (customer) => {
        if (selectedCustomer?.id === customer.id) {
            setSelectedCustomer(null);
            setCustomerDetail(null);
        } else {
            setSelectedCustomer(customer);
            fetchCustomerDetail(customer.id);
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

            fetchCustomers();
            if (selectedCustomer?.id === editingCustomer?.id) {
                fetchCustomerDetail(editingCustomer.id);
            }
            closeModal();
        } catch (error) {
            console.error('Failed to save customer:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('確定要刪除此客戶嗎？')) return;
        try {
            await fetch(`/api/customers/${id}`, { method: 'DELETE' });
            if (selectedCustomer?.id === id) {
                setSelectedCustomer(null);
                setCustomerDetail(null);
            }
            fetchCustomers();
        } catch (error) {
            console.error('Failed to delete customer:', error);
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: '待處理',
            processing: '處理中',
            completed: '已完成',
            cancelled: '已取消'
        };
        return labels[status] || status;
    };

    const getInitials = (name) => {
        return name ? name.slice(0, 2).toUpperCase() : '??';
    };

    // Sort indicator for column headers
    const SortHeader = ({ label, ascKey, descKey }) => {
        const isAsc = sortBy === ascKey;
        const isDesc = sortBy === descKey;
        return (
            <th style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => setSortBy(isDesc ? ascKey : descKey)}>
                {label}
                <span style={{ marginLeft: '4px', color: (isAsc || isDesc) ? 'var(--accent)' : 'var(--text-muted)', fontSize: '11px' }}>
                    {isAsc ? '▲' : isDesc ? '▼' : '⇅'}
                </span>
            </th>
        );
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">客戶管理</h1>
                <p className="page-subtitle">管理您的客戶資料與消費紀錄</p>
            </div>

            <div className="toolbar">
                <button className="btn btn-primary" onClick={() => openModal()}>
                    ＋ 新增客戶
                </button>
                <input
                    type="text"
                    className="form-input search-input"
                    placeholder="搜尋客戶名稱、Email、電話..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select
                    className="form-select"
                    style={{ width: 'auto' }}
                    value={filterBy}
                    onChange={e => setFilterBy(e.target.value)}
                >
                    <option value="all">全部客戶</option>
                    <option value="has_orders">有訂單</option>
                    <option value="no_orders">未有訂單</option>
                    <option value="high_value">高消費（≥ NT$10,000）</option>
                </select>
                <select
                    className="form-select"
                    style={{ width: 'auto' }}
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                >
                    <option value="newest">最新加入</option>
                    <option value="oldest">最早加入</option>
                    <option value="name_asc">名稱 A→Z</option>
                    <option value="name_desc">名稱 Z→A</option>
                    <option value="orders_desc">訂單數（多→少）</option>
                    <option value="orders_asc">訂單數（少→多）</option>
                    <option value="spent_desc">消費（高→低）</option>
                    <option value="spent_asc">消費（低→高）</option>
                </select>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px', alignSelf: 'center', whiteSpace: 'nowrap' }}>
                    {processedCustomers.length} / {customers.length} 位
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedCustomer ? '1fr 380px' : '1fr', gap: '24px' }}>
                {/* Customer List */}
                <div className="card">
                    {processedCustomers.length > 0 ? (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <SortHeader label="客戶" ascKey="name_asc" descKey="name_desc" />
                                        <th>電話</th>
                                        <SortHeader label="訂單數" ascKey="orders_asc" descKey="orders_desc" />
                                        <SortHeader label="總消費" ascKey="spent_asc" descKey="spent_desc" />
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {processedCustomers.map((customer) => (
                                        <tr
                                            key={customer.id}
                                            style={{
                                                cursor: 'pointer',
                                                background: selectedCustomer?.id === customer.id ? 'var(--accent-glow)' : ''
                                            }}
                                            onClick={() => handleSelectCustomer(customer)}
                                        >
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, var(--accent), #0099cc)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '13px',
                                                        fontWeight: 700,
                                                        color: '#000',
                                                        flexShrink: 0
                                                    }}>
                                                        {getInitials(customer.name)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{customer.name}</div>
                                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{customer.email || '—'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{customer.phone || '—'}</td>
                                            <td>
                                                <span style={{
                                                    background: 'rgba(59,130,246,0.12)',
                                                    color: 'var(--info)',
                                                    padding: '2px 10px',
                                                    borderRadius: '12px',
                                                    fontSize: '13px',
                                                    fontWeight: 600
                                                }}>
                                                    {customer.order_count || 0}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                                                {customer.total_spent > 0 ? formatCurrency(customer.total_spent) : '—'}
                                            </td>
                                            <td onClick={e => e.stopPropagation()}>
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
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">👥</div>
                            <p className="empty-state-text">
                                {search || filterBy !== 'all' ? '找不到符合的客戶' : '尚無客戶資料'}
                            </p>
                            {!search && filterBy === 'all' && (
                                <button className="btn btn-primary" onClick={() => openModal()}>
                                    新增第一位客戶
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Customer Detail Panel */}
                {selectedCustomer && (
                    <div className="card slide-up" style={{ height: 'fit-content', position: 'sticky', top: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>客戶詳情</h3>
                            <button
                                className="modal-close"
                                style={{ width: '28px', height: '28px', fontSize: '16px' }}
                                onClick={() => { setSelectedCustomer(null); setCustomerDetail(null); }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Avatar + Name */}
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--accent), #0099cc)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                fontWeight: 700,
                                color: '#000',
                                margin: '0 auto 12px',
                                boxShadow: 'var(--shadow-glow)'
                            }}>
                                {getInitials(selectedCustomer.name)}
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '18px', color: 'var(--text-primary)' }}>
                                {selectedCustomer.name}
                            </div>
                            {selectedCustomer.email && (
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    {selectedCustomer.email}
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        {customerDetail && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                <div style={{
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '14px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--info)' }}>
                                        {customerDetail.order_count || 0}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>訂單數</div>
                                </div>
                                <div style={{
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '14px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--success)' }}>
                                        {customerDetail.total_spent > 0 ? formatCurrency(customerDetail.total_spent) : '—'}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>總消費</div>
                                </div>
                            </div>
                        )}

                        {/* Contact Info */}
                        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {selectedCustomer.phone && (
                                <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
                                    <span style={{ color: 'var(--text-muted)', minWidth: '32px' }}>📞</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{selectedCustomer.phone}</span>
                                </div>
                            )}
                            {selectedCustomer.address && (
                                <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
                                    <span style={{ color: 'var(--text-muted)', minWidth: '32px' }}>📍</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{selectedCustomer.address}</span>
                                </div>
                            )}
                        </div>

                        {/* Order History */}
                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>
                                訂單記錄
                            </h4>
                            {detailLoading ? (
                                <div className="loading" style={{ padding: '20px' }}>
                                    <div className="spinner"></div>
                                </div>
                            ) : customerDetail?.orders?.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                                    {customerDetail.orders.map(order => (
                                        <div key={order.id} style={{
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: 'var(--radius-md)',
                                            padding: '12px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)' }}>
                                                    #{String(order.id).padStart(4, '0')}
                                                </div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                    {formatDate(order.created_at)}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                    {formatCurrency(order.total)}
                                                </div>
                                                <span className={`status-badge ${order.status}`} style={{ fontSize: '11px', padding: '2px 8px', marginTop: '4px' }}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                    尚無訂單記錄
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                            <button
                                className="btn btn-secondary"
                                style={{ width: '100%' }}
                                onClick={() => openModal(selectedCustomer)}
                            >
                                編輯客戶資料
                            </button>
                        </div>
                    </div>
                )}
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
