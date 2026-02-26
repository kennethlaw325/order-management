import { useState, useEffect } from 'react';
import { formatCurrency, getStatusLabel, formatDate } from '../utils';
import { useToast } from '../components/Toast';

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/stats');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            toast.error('無法載入統計資料');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">儀表板</h1>
                <p className="page-subtitle">訂單系統總覽</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="stat-icon orders">📦</div>
                    <div className="stat-value">{stats?.orders?.total || 0}</div>
                    <div className="stat-label">總訂單數</div>
                </div>
                <div className="stat-card slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="stat-icon revenue">💰</div>
                    <div className="stat-value">{formatCurrency(stats?.revenue || 0)}</div>
                    <div className="stat-label">總收入（已完成）</div>
                </div>
                <div className="stat-card slide-up" style={{ animationDelay: '0.3s' }}>
                    <div className="stat-icon customers">👥</div>
                    <div className="stat-value">{stats?.customers || 0}</div>
                    <div className="stat-label">客戶數</div>
                </div>
                <div className="stat-card slide-up" style={{ animationDelay: '0.4s' }}>
                    <div className="stat-icon products">🏷️</div>
                    <div className="stat-value">{stats?.products?.total || 0}</div>
                    <div className="stat-label">產品數</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="card slide-up" style={{ animationDelay: '0.5s' }}>
                    <div className="card-header">
                        <h2 className="card-title">訂單狀態</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="status-badge pending">⏳ 待處理</span>
                            <span style={{ fontWeight: 600 }}>{stats?.orders?.pending || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="status-badge processing">🔄 處理中</span>
                            <span style={{ fontWeight: 600 }}>{stats?.orders?.processing || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="status-badge completed">✓ 已完成</span>
                            <span style={{ fontWeight: 600 }}>{stats?.orders?.completed || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="status-badge cancelled">✗ 已取消</span>
                            <span style={{ fontWeight: 600 }}>{stats?.orders?.cancelled || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="card slide-up" style={{ animationDelay: '0.6s' }}>
                    <div className="card-header">
                        <h2 className="card-title">庫存警示</h2>
                    </div>
                    {stats?.products?.low_stock > 0 ? (
                        <div style={{
                            padding: '16px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <span style={{ fontSize: '24px' }}>⚠️</span>
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--warning)' }}>
                                    {stats.products.low_stock} 件商品庫存不足
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                    庫存低於 10 件
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                            ✓ 所有商品庫存充足
                        </div>
                    )}
                </div>
            </div>

            <div className="card slide-up" style={{ marginTop: '24px', animationDelay: '0.7s' }}>
                <div className="card-header">
                    <h2 className="card-title">近期訂單</h2>
                </div>
                {stats?.recentOrders?.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>訂單編號</th>
                                    <th>客戶</th>
                                    <th>金額</th>
                                    <th>狀態</th>
                                    <th>時間</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map((order) => (
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <p className="empty-state-text">尚無訂單記錄</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
