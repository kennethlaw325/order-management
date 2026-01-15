import { NavLink } from 'react-router-dom';

function Sidebar() {
    const navItems = [
        { path: '/', icon: '📊', label: '儀表板' },
        { path: '/orders', icon: '📦', label: '訂單管理' },
        { path: '/customers', icon: '👥', label: '客戶管理' },
        { path: '/products', icon: '🏷️', label: '產品管理' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">📋</div>
                    <span className="sidebar-logo-text">訂單管理</span>
                </div>
            </div>
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        end={item.path === '/'}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}

export default Sidebar;
