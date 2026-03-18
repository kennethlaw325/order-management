// src/components/Layout.jsx
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ToastProvider } from './Toast';
import { Bell, Sun, Moon } from 'lucide-react';
import { cn } from '../utils';
import { Button } from './ui';

const PAGE_TITLES = {
    '/': { title: '儀表板', subtitle: '訂單管理系統總覽' },
    '/orders': { title: '訂單管理', subtitle: '管理所有訂單及狀態' },
    '/customers': { title: '客戶管理', subtitle: '管理客戶資訊及聯絡方式' },
    '/products': { title: '產品管理', subtitle: '管理產品目錄及庫存' },
};

function Layout() {
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

    const pageInfo = PAGE_TITLES[location.pathname] || PAGE_TITLES['/'];

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
    }, [sidebarCollapsed]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(prev => !prev)} />
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
                        <div className="h-8 w-px bg-border mx-1" />
                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xs cursor-pointer">
                            KL
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-6">
                    <ToastProvider>
                        <Outlet />
                    </ToastProvider>
                </main>
            </div>
        </div>
    );
}

export default Layout;
