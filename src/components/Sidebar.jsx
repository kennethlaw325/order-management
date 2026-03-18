// src/components/Sidebar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, Package, Settings, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '../utils';
import { Button } from './ui';

function Sidebar({ collapsed, onToggle, badgeCounts = {} }) {
    const [searchQuery, setSearchQuery] = useState('');
    const { pendingOrders = 0, lowStock = 0 } = badgeCounts;

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: '儀表板' },
        { path: '/orders', icon: ShoppingCart, label: '訂單管理', badge: pendingOrders || null },
        { path: '/customers', icon: Users, label: '客戶管理' },
        { path: '/products', icon: Package, label: '產品管理', badge: lowStock > 0 ? '!' : null, badgeAlert: true },
    ];

    return (
        <aside className={cn(
            'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 flex flex-col',
            collapsed ? 'w-16' : 'w-64'
        )}>
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
                {!collapsed ? (
                    <>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                                <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-base">OMS Pro</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 flex-shrink-0">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <div className="w-full flex flex-col items-center gap-1">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <Button variant="ghost" size="icon" onClick={onToggle} className="h-6 w-6">
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Search */}
            {!collapsed ? (
                <div className="px-3 py-2 border-b border-border flex-shrink-0">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="搜尋..."
                            className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted border-0 rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>
                </div>
            ) : (
                <div className="px-2 py-2 border-b border-border flex-shrink-0 flex justify-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                                : 'text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800',
                            collapsed && 'justify-center px-2'
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-indigo-600 dark:text-indigo-400')} />
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
                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                                                : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
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
            <div className="border-t border-border flex-shrink-0">
                <div className="p-2">
                    <button className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150',
                        collapsed && 'justify-center px-2'
                    )}>
                        <Settings className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span>設定</span>}
                    </button>
                </div>
                {/* User profile */}
                <div className={cn(
                    'px-3 py-3 border-t border-border flex items-center gap-3',
                    collapsed && 'justify-center px-2'
                )}>
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xs flex-shrink-0">
                        KL
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <p className="text-sm font-medium leading-tight truncate">Kenneth</p>
                            <p className="text-xs text-muted-foreground truncate">管理員</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
