import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, Package, Settings } from 'lucide-react';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: '儀表板' },
    { path: '/orders', icon: ShoppingCart, label: '訂單管理' },
    { path: '/customers', icon: Users, label: '客戶管理' },
    { path: '/products', icon: Package, label: '產品管理' },
];

function Sidebar() {
    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex">
            <div className="h-16 flex items-center px-6 border-b border-gray-200">
                <div className="flex items-center gap-2 text-indigo-600">
                    <Package className="w-6 h-6" />
                    <span className="text-lg font-bold tracking-tight text-gray-900">OMS Pro</span>
                </div>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map(({ path, icon: Icon, label }) => (
                    <NavLink
                        key={path}
                        to={path}
                        end={path === '/'}
                        className={({ isActive }) =>
                            `w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                                isActive
                                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                                <span className="text-sm">{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-200">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                    <Settings className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">設定</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
