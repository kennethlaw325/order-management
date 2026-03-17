import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, Package, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils';
import { Button } from './ui';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: '儀表板' },
    { path: '/orders', icon: ShoppingCart, label: '訂單管理' },
    { path: '/customers', icon: Users, label: '客戶管理' },
    { path: '/products', icon: Package, label: '產品管理' },
];

function Sidebar({ collapsed, onToggle }) {
    return (
        <aside className={cn(
            'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 flex flex-col',
            collapsed ? 'w-16' : 'w-64'
        )}>
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-lg">OMS Pro</span>
                    </div>
                )}
                {collapsed && (
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
                        <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
                    </div>
                )}
                <Button variant="ghost" size="icon" onClick={onToggle} className={cn('h-8 w-8', collapsed && 'absolute -right-4 top-5 bg-card border shadow-sm')}>
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {navItems.map(({ path, icon: Icon, label }) => (
                    <NavLink
                        key={path}
                        to={path}
                        end={path === '/'}
                        className={({ isActive }) => cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                            isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                            collapsed && 'justify-center px-2'
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary')} />
                                {!collapsed && <span>{label}</span>}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Settings */}
            <div className={cn('p-2 border-t border-border', collapsed && 'flex justify-center')}>
                <button className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
                    collapsed && 'justify-center px-2 w-auto'
                )}>
                    <Settings className="w-5 h-5" />
                    {!collapsed && <span>設定</span>}
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
