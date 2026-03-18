// src/components/Sidebar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, Package, Settings, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '../utils';
import { Button } from './ui';
import { useSettings } from '../contexts/SettingsContext';

function Sidebar({ collapsed, onToggle, badgeCounts = {} }) {
    const [searchQuery, setSearchQuery] = useState('');
    const { profile } = useSettings();
    const { pendingOrders = 0, lowStock = 0 } = badgeCounts;

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: '儀表板' },
        { path: '/orders', icon: ShoppingCart, label: '訂單管理', badge: pendingOrders || null },
        { path: '/customers', icon: Users, label: '客戶管理' },
        { path: '/products', icon: Package, label: '產品管理', badge: lowStock > 0 ? '!' : null, badgeAlert: true },
    ];

    return (
        <aside className={cn(
            'fixed left-0 top-0 z-40 h-screen transition-all duration-300 flex flex-col',
            'bg-card border-r border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800',
            collapsed ? 'w-16' : 'w-64'
        )}>
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                {!collapsed ? (
                    <>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                                <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-base text-zinc-900 dark:text-white">OMS Pro</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 flex-shrink-0 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <div className="w-full flex flex-col items-center gap-1 py-0.5">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                            <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <Button variant="ghost" size="icon" onClick={onToggle} className="h-6 w-6 flex-shrink-0 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800">
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Search */}
            {!collapsed ? (
                <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="搜尋..."
                            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border-0 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-zinc-200/70 text-zinc-900 placeholder:text-zinc-400 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                        />
                    </div>
                </div>
            ) : (
                <div className="px-2 py-2 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0 flex justify-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800">
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
                {navItems.map(({ path, icon: Icon, label, badge, badgeAlert }) => (
                    <NavLink
                        key={path}
                        to={path}
                        end={path === '/'}
                        className={({ isActive }) => cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 relative',
                            isActive
                                ? 'bg-indigo-600 text-white'
                                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/80 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800',
                            collapsed && 'justify-center px-2'
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {!collapsed && <span className="flex-1">{label}</span>}
                                {badge !== null && badge !== undefined && (
                                    collapsed ? (
                                        <span className={cn(
                                            'absolute top-1 right-1 w-2 h-2 rounded-full',
                                            badgeAlert ? 'bg-amber-500' : 'bg-indigo-500'
                                        )} />
                                    ) : (
                                        <span className={cn(
                                            'text-xs px-1.5 py-0.5 rounded-full font-medium',
                                            badgeAlert
                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                                                : 'bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
                                        )}>
                                            {badge}
                                        </span>
                                    )
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Settings + User Profile */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                <div className="p-2">
                    <NavLink
                        to="/settings"
                        className={({ isActive }) => cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-150',
                            isActive
                                ? 'bg-indigo-600 text-white'
                                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/80 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800',
                            collapsed && 'justify-center px-2'
                        )}
                    >
                        <Settings className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span>設定</span>}
                    </NavLink>
                </div>
                {/* User profile */}
                <div className={cn(
                    'px-3 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-3',
                    collapsed && 'justify-center px-2'
                )}>
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xs flex-shrink-0">
                        {profile.name.slice(0, 2).toUpperCase()}
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <p className="text-sm font-medium leading-tight truncate text-zinc-900 dark:text-white">{profile.name}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{profile.role}</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
