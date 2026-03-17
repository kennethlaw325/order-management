import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ToastProvider } from './Toast';
import { Search, Bell, Sun, Moon } from 'lucide-react';
import { cn } from '../utils';
import { Button, Input } from './ui';

function Layout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
    }, [sidebarCollapsed]);

    // Dark mode
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
                <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="搜尋訂單、客戶、產品..." className="pl-10" />
                        </div>
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
                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-sm cursor-pointer">
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
