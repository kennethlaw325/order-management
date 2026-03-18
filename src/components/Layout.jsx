// src/components/Layout.jsx
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ToastProvider } from './Toast';
import { Bell, Sun, Moon } from 'lucide-react';
import { cn } from '../utils';
import { Button } from './ui';
import { useSettings } from '../contexts/SettingsContext';

const PAGE_TITLES = {
    '/': { title: '儀表板', subtitle: '訂單管理系統總覽' },
    '/orders': { title: '訂單管理', subtitle: '管理所有訂單及狀態' },
    '/customers': { title: '客戶管理', subtitle: '管理客戶資訊及聯絡方式' },
    '/products': { title: '產品管理', subtitle: '管理產品目錄及庫存' },
    '/settings': { title: '設定', subtitle: '系統及個人偏好設定' },
};

function Layout() {
    const location = useLocation();
    const { darkMode, setDarkMode } = useSettings();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
    const [badgeCounts, setBadgeCounts] = useState({ pendingOrders: 0, lowStock: 0 });

    useEffect(() => {
        fetch('/api/stats')
            .then(r => r.json())
            .then(data => setBadgeCounts({
                pendingOrders: data?.orders?.pending || 0,
                lowStock: data?.products?.low_stock || 0,
            }))
            .catch(() => {});
    }, []);

    const pageInfo = PAGE_TITLES[location.pathname] || PAGE_TITLES['/'];

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
    }, [sidebarCollapsed]);

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(prev => !prev)} badgeCounts={badgeCounts} />
            <div className={cn(
                'flex-1 flex flex-col transition-all duration-300',
                sidebarCollapsed ? 'ml-16' : 'ml-64'
            )}>
                {/* Header */}
                <header className="h-16 bg-card/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-6 sticky top-0 z-30 dark:bg-background/80">
                    <div>
                        <h1 className="text-xl font-semibold leading-tight">{pageInfo.title}</h1>
                        <p className="text-xs text-muted-foreground">{pageInfo.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
                            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
                        </Button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-6">
                    <ToastProvider>
                        <div key={location.pathname} className="animate-fade-in">
                            <Outlet />
                        </div>
                    </ToastProvider>
                </main>
            </div>
        </div>
    );
}

export default Layout;
