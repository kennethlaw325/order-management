# Dual-Tone Polish UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 完整實作 Dual-Tone Polish UI redesign spec — Zinc + Indigo 色系，Geist Sans 字體，完整 light/dark mode，sidebar 搜尋 + badges + user profile，header 頁面標題，Toast top-right，CSS animations。

**Architecture:** 純前端改動為主（除 Task 7 需後端加 order_count JOIN）。CSS variables 集中喺 `index.css` 管理，所有組件透過 Tailwind utilities 繼承顏色。無需新 UI 依賴（recharts 係 chart library 不算 UI lib，可另行加）。

**Tech Stack:** React 19, Vite, Express 5, Tailwind CSS v4, Lucide React, Google Fonts (Geist Sans)

**Spec reference:** `docs/superpowers/specs/2026-03-18-dual-tone-polish-design.md`

---

## Task 1: 解決 Git 同步問題 + Commit Refactoring

### 背景
- Remote 有 2 個新 commits（spec 文件、CLAUDE.md 等），本地落後
- `server/orders.db` 被 server process 鎖住，阻止 pull
- 本地有未 commit 的 page refactoring

**Files:**
- No code changes — git operations only

**Step 1: 停止 server（如果在跑）**

```bash
# 喺另一個 terminal 按 Ctrl+C 停止 server
# 或者：
taskkill /F /IM node.exe 2>/dev/null || true
```

**Step 2: Commit 本地 refactoring 先**

```bash
cd C:/Users/Kenneth/Projects/order-management
git add src/pages/Dashboard/ src/pages/Orders/ src/pages/Customers/ src/pages/Products/
git add src/components/LoadingSpinner.jsx
git add -u src/pages/Customers.jsx src/pages/Dashboard.jsx src/pages/Orders.jsx src/pages/Products.jsx
git add docs/plans/
git commit -m "refactor: split pages into sub-folder components

- Dashboard → StatCards, OrderStatusCard, StockAlertCard, RecentOrdersTable
- Orders → OrderFilters, OrderTable, CreateOrderModal
- Customers → CustomerStatsCard, CustomerTable, CustomerModal
- Products → ProductStatsCards, ProductTable, ProductModal
- Add LoadingSpinner component
- Add docs/plans/ directory"
```

**Step 3: Pull remote (merge strategy)**

```bash
git pull origin main --no-rebase
```

如果 `orders.db` conflict：
```bash
git checkout --theirs server/orders.db
git add server/orders.db
git merge --continue
```

**Step 4: Verify**

```bash
git log --oneline -5
git status
```

Expected: clean working tree, 所有 commits in order

---

## Task 2: Design Tokens + Typography

**Files:**
- Modify: `src/index.css`

**Step 1: 讀現有 index.css 確認 token 結構**

```bash
cat src/index.css
```

**Step 2: 替換 CSS variables（完整替換 :root 同 .dark block）**

```css
/* src/index.css — 完整替換 */
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
}

/* Light Mode — Zinc + Indigo */
:root {
  --background: 240 5% 96%;       /* zinc-100 #f4f4f5 */
  --foreground: 240 10% 11%;      /* zinc-900 #18181b */
  --card: 0 0% 100%;              /* white */
  --card-foreground: 240 10% 11%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 11%;
  --primary: 239 84% 60%;         /* indigo-600 #4f46e5 */
  --primary-foreground: 0 0% 100%;
  --secondary: 240 5% 96%;
  --secondary-foreground: 240 10% 11%;
  --muted: 240 5% 96%;            /* zinc-100 */
  --muted-foreground: 240 4% 46%; /* zinc-500 #71717a */
  --accent: 240 5% 92%;           /* zinc-200 */
  --accent-foreground: 240 10% 11%;
  --destructive: 0 72% 51%;       /* red-600 #dc2626 */
  --destructive-foreground: 0 0% 100%;
  --border: 240 6% 90%;           /* zinc-200 #e4e4e7 */
  --input: 240 6% 90%;
  --ring: 239 84% 60%;
  --radius: 0.75rem;
}

/* Dark Mode — Zinc deep */
.dark {
  --background: 240 10% 4%;       /* zinc-950 #09090b */
  --foreground: 240 5% 96%;       /* zinc-50 #fafafa */
  --card: 240 10% 11%;            /* zinc-900 #18181b */
  --card-foreground: 240 5% 96%;
  --popover: 240 10% 11%;
  --popover-foreground: 240 5% 96%;
  --primary: 234 89% 74%;         /* indigo-400 #818cf8 */
  --primary-foreground: 240 10% 4%;
  --secondary: 240 4% 16%;
  --secondary-foreground: 240 5% 96%;
  --muted: 240 4% 16%;            /* zinc-800 #27272a */
  --muted-foreground: 240 5% 65%; /* zinc-400 #a1a1aa */
  --accent: 240 4% 16%;
  --accent-foreground: 240 5% 96%;
  --destructive: 0 91% 71%;       /* red-400 #f87171 */
  --destructive-foreground: 240 10% 4%;
  --border: 240 4% 16%;           /* zinc-800 */
  --input: 240 4% 16%;
  --ring: 234 89% 74%;
}

*, *::before, *::after { box-sizing: border-box; }
html, body, #root { height: 100%; }

body {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}

*, *::before, *::after {
  border-color: hsl(var(--border));
}
```

**Step 3: 啟動 dev server 確認字體 + 顏色變化**

```bash
npm run dev
```

打開 http://localhost:5173，確認：
- 字體改成 Geist（較圓潤）
- Light mode background 略帶灰藍色（zinc-100）
- Buttons 由黑色變成 indigo 紫色

**Step 4: Commit**

```bash
git add src/index.css
git commit -m "feat: migrate to Zinc+Indigo design tokens and Geist Sans font"
```

---

## Task 3: StatusBadge + Toast 顏色對齊 Spec

**Files:**
- Modify: `src/components/ui/StatusBadge.jsx`
- Modify: `src/components/Toast.jsx`

**Step 1: 更新 StatusBadge（green → emerald, yellow → amber）**

```jsx
// src/components/ui/StatusBadge.jsx
import { Badge } from './Badge';

const STATUS_CONFIG = {
    pending: {
        label: '待處理',
        cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        dot: 'bg-amber-500 dark:bg-amber-400',
    },
    processing: {
        label: '處理中',
        cls: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
        dot: 'bg-blue-500 dark:bg-blue-400',
    },
    completed: {
        label: '已完成',
        cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
        dot: 'bg-emerald-500 dark:bg-emerald-400',
    },
    cancelled: {
        label: '已取消',
        cls: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
        dot: 'bg-red-500 dark:bg-red-400',
    },
};

export function StatusBadge({ status }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <Badge className={`${config.cls} inline-flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </Badge>
    );
}
```

**Step 2: 重寫 Toast.jsx（top-right, type-based duration, left border）**

```jsx
// src/components/Toast.jsx — 完整替換
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
}

let toastId = 0;

const DURATIONS = { success: 3000, warning: 5000, error: null }; // null = manual dismiss only

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'success') => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type }]);
        const duration = DURATIONS[type];
        if (duration !== null) {
            setTimeout(() => removeToast(id), duration);
        }
    }, [removeToast]);

    const toast = useMemo(() => ({
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        warning: (msg) => addToast(msg, 'warning'),
    }), [addToast]);

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
                {toasts.map(t => (
                    <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

const TOAST_CONFIG = {
    success: {
        icon: CheckCircle,
        cls: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200',
        border: 'border-l-emerald-500 dark:border-l-emerald-400',
    },
    error: {
        icon: XCircle,
        cls: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200',
        border: 'border-l-red-500 dark:border-l-red-400',
    },
    warning: {
        icon: AlertTriangle,
        cls: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200',
        border: 'border-l-amber-500 dark:border-l-amber-400',
    },
};

function ToastItem({ toast, onClose }) {
    const [visible, setVisible] = useState(false);
    const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.success;
    const Icon = config.icon;

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    return (
        <div
            className={`flex items-start gap-3 px-4 py-3 rounded-lg text-sm font-medium min-w-[280px] max-w-[400px] shadow-lg border border-l-4 ${config.cls} ${config.border}`}
            style={{
                transform: visible ? 'translateY(0)' : 'translateY(-12px)',
                opacity: visible ? 1 : 0,
                transition: 'transform 0.2s ease, opacity 0.2s ease',
            }}
        >
            <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="flex-1">{toast.message}</span>
            <button onClick={onClose} className="opacity-60 hover:opacity-100 cursor-pointer bg-transparent border-none text-inherit flex-shrink-0">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
```

**Step 3: 測試**

Dev server 開著，觸發成功/錯誤 toast，確認：
- Toast 出現喺右上角（唔係右下）
- 顏色：成功綠色，錯誤紅色，警告橙色
- 左邊有彩色粗 border
- Error toast 唔會自動消失

**Step 4: Commit**

```bash
git add src/components/ui/StatusBadge.jsx src/components/Toast.jsx
git commit -m "feat: update StatusBadge colors and redesign Toast to top-right with type durations"
```

---

## Task 4: Header 重設計（page title from route + glassmorphism）

**Files:**
- Modify: `src/components/Layout.jsx`
- Modify: `src/pages/Dashboard/index.jsx`
- Modify: `src/pages/Orders/index.jsx`
- Modify: `src/pages/Customers/index.jsx`
- Modify: `src/pages/Products/index.jsx`

**Step 1: 更新 Layout.jsx**

改動：
1. 加 `useLocation` hook 根據 route 顯示頁面標題
2. Header 改為 glassmorphism style
3. 移除 header search（改落 Sidebar）
4. 左邊顯示頁面 title + subtitle

```jsx
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
```

**Step 2: 移除各頁面嘅 `<h1>` heading block**

每個 `src/pages/*/index.jsx` 都有類似：
```jsx
<div>
    <h1 className="text-3xl font-bold tracking-tight">儀表板</h1>
    <p className="text-muted-foreground mt-1">訂單系統總覽</p>
</div>
```

全部 4 個頁面移除呢個 `<div>` block（因為 Layout header 已經顯示）。

**Step 3: 確認**

切換頁面，header 左邊顯示正確 title + subtitle。

**Step 4: Commit**

```bash
git add src/components/Layout.jsx src/pages/Dashboard/index.jsx src/pages/Orders/index.jsx src/pages/Customers/index.jsx src/pages/Products/index.jsx
git commit -m "feat: redesign header with page title from route and glassmorphism style"
```

---

## Task 5: Sidebar 升級（search + badges + user profile）

**Files:**
- Modify: `src/components/Sidebar.jsx`
- Modify: `src/components/Layout.jsx` (傳 badge counts)
- Modify: `server/routes/stats.js` (已有 pending + low_stock，無需改)

**Step 1: 喺 Layout.jsx 加 badge data fetch**

喺 Layout component 加 stats fetch（pending orders + low stock）：

```jsx
// 加喺 Layout function 入面，useState 之後
const [badgeCounts, setBadgeCounts] = useState({ pendingOrders: 0, lowStock: 0 });

useEffect(() => {
    fetch('/api/stats')
        .then(r => r.json())
        .then(data => setBadgeCounts({
            pendingOrders: data?.orders?.pending || 0,
            lowStock: data?.products?.low_stock || 0,
        }))
        .catch(() => {}); // silent fail — badges are optional
}, []);
```

傳落 Sidebar：
```jsx
<Sidebar collapsed={sidebarCollapsed} onToggle={...} badgeCounts={badgeCounts} />
```

**Step 2: 重寫 Sidebar.jsx**

```jsx
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
```

**Step 3: 確認**

- Sidebar 有 search bar
- Orders 顯示 pending count badge
- Products 顯示 `!` 警告 badge（如有低庫存）
- Collapsed 狀態下 badges 變 dot indicators
- 底部有 user profile

**Step 4: Commit**

```bash
git add src/components/Sidebar.jsx src/components/Layout.jsx
git commit -m "feat: upgrade sidebar with search, nav badges, and user profile area"
```

---

## Task 6: Dashboard 重設計（KPI animated counter + CSS status bar chart）

**Files:**
- Modify: `src/pages/Dashboard/StatCards.jsx`
- Modify: `src/pages/Dashboard/OrderStatusCard.jsx`
- Modify: `src/pages/Dashboard/StockAlertCard.jsx`
- Modify: `src/pages/Dashboard/RecentOrdersTable.jsx`
- Modify: `src/pages/Dashboard/index.jsx`
- Modify: `server/routes/stats.js` (加 week-over-week trends)

**Step 1: 擴充 stats API — week-over-week**

喺 `server/routes/stats.js`，加喺 `salesByDay` query 之後、`res.json` 之前：

```js
const thisWeek = db.prepare(`
    SELECT COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue
    FROM orders WHERE created_at >= date('now', '-7 days') AND status != 'cancelled'
`).get();

const lastWeek = db.prepare(`
    SELECT COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue
    FROM orders WHERE created_at >= date('now', '-14 days')
      AND created_at < date('now', '-7 days') AND status != 'cancelled'
`).get();

const thisWeekCustomers = db.prepare(`
    SELECT COUNT(*) as count FROM customers WHERE created_at >= date('now', '-7 days')
`).get();

const lastWeekCustomers = db.prepare(`
    SELECT COUNT(*) as count FROM customers
    WHERE created_at >= date('now', '-14 days') AND created_at < date('now', '-7 days')
`).get();

const calcTrend = (curr, prev) => {
    if (!prev || prev === 0) return null;
    return ((curr - prev) / prev * 100).toFixed(1);
};

const trends = {
    orders: calcTrend(thisWeek.orders, lastWeek.orders),
    revenue: calcTrend(thisWeek.revenue, lastWeek.revenue),
    customers: calcTrend(thisWeekCustomers.count, lastWeekCustomers.count),
};
```

喺 `res.json(...)` 加 `trends`：
```js
res.json({ orders: orderStats, revenue: revenue.total_revenue, customers: customerCount.count, products: productStats, recentOrders, salesByDay, trends });
```

**Step 2: 重寫 StatCards.jsx（animated counter + icon circle + trend badge）**

```jsx
// src/pages/Dashboard/StatCards.jsx
import { useEffect, useRef } from 'react';
import { Package, DollarSign, Users, Tag, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui';

function useCountUp(target, duration = 800) {
    const ref = useRef(null);
    useEffect(() => {
        if (target === null || target === undefined) return;
        const numericTarget = parseFloat(String(target).replace(/[^0-9.]/g, ''));
        if (isNaN(numericTarget)) {
            if (ref.current) ref.current.textContent = target;
            return;
        }
        const start = performance.now();
        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
        const isFormatted = String(target).includes(',') || String(target).startsWith('NT');

        const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const value = numericTarget * easeOutCubic(progress);
            if (ref.current) {
                ref.current.textContent = isFormatted
                    ? `NT$${Math.round(value).toLocaleString()}`
                    : Math.round(value).toString();
            }
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [target, duration]);
    return ref;
}

function TrendBadge({ trend }) {
    if (trend === null || trend === undefined) return <span className="text-xs text-muted-foreground">—</span>;
    const value = parseFloat(trend);
    const positive = value >= 0;
    const Icon = positive ? ArrowUpRight : ArrowDownRight;
    return (
        <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            <Icon className="h-3 w-3" />
            {Math.abs(value)}% 較上週
        </span>
    );
}

function StatCard({ label, value, icon: Icon, trend, iconBg = 'bg-indigo-50 dark:bg-indigo-950/50', iconColor = 'text-indigo-600 dark:text-indigo-400' }) {
    const countRef = useCountUp(value);
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold" ref={countRef}>{value}</div>
                <div className="mt-1">
                    <TrendBadge trend={trend} />
                </div>
            </CardContent>
        </Card>
    );
}

function StatCards({ stats }) {
    const trends = stats?.trends || {};
    const cards = [
        { label: '總訂單數', value: stats?.orders?.total || 0, icon: Package, trend: trends.orders },
        { label: '總收入（已完成）', value: `NT$${(stats?.revenue || 0).toLocaleString()}`, icon: DollarSign, trend: trends.revenue },
        { label: '客戶數', value: stats?.customers || 0, icon: Users, trend: trends.customers },
        { label: '產品數', value: stats?.products?.total || 0, icon: Tag, trend: null },
    ];
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(card => <StatCard key={card.label} {...card} />)}
        </div>
    );
}

export default StatCards;
```

**Step 3: 重寫 OrderStatusCard.jsx（CSS-only horizontal bar chart）**

```jsx
// src/pages/Dashboard/OrderStatusCard.jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui';

const STATUS_BARS = [
    { key: 'pending', label: '待處理', color: 'bg-amber-500' },
    { key: 'processing', label: '處理中', color: 'bg-blue-500' },
    { key: 'completed', label: '已完成', color: 'bg-emerald-500' },
    { key: 'cancelled', label: '已取消', color: 'bg-red-400' },
];

function OrderStatusCard({ orders }) {
    const total = orders?.total || 0;
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">訂單狀態分佈</CardTitle>
                <CardDescription>共 {total} 筆訂單</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {STATUS_BARS.map(({ key, label, color }) => {
                    const count = orders?.[key] || 0;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                        <div key={key}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">{label}</span>
                                <span className="font-medium">{count} <span className="text-muted-foreground text-xs">({pct}%)</span></span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${color} rounded-full transition-all duration-700`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

export default OrderStatusCard;
```

**Step 4: 更新 StockAlertCard.jsx（加 severity dots + link to products）**

```jsx
// src/pages/Dashboard/StockAlertCard.jsx
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui';

function StockAlertCard({ lowStock }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">庫存警示</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {lowStock > 0 ? (
                    <>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{lowStock} 項產品庫存偏低</p>
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">庫存低於 10 件</p>
                            </div>
                        </div>
                        <Link to="/products" className="text-sm text-primary hover:underline block text-center">查看全部產品 →</Link>
                    </>
                ) : (
                    <div className="flex flex-col items-center py-6 text-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-2">
                            <span className="text-emerald-500 text-lg">✓</span>
                        </div>
                        <p className="text-sm text-muted-foreground">所有產品庫存充足</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default StockAlertCard;
```

**Step 5: 更新 RecentOrdersTable.jsx（加 "查看全部" link）**

在 `CardHeader` 加：
```jsx
import { Link } from 'react-router-dom';

// CardHeader 改為：
<CardHeader className="flex flex-row items-center justify-between">
    <div>
        <CardTitle className="text-base">近期訂單</CardTitle>
        <CardDescription>最近的訂單記錄</CardDescription>
    </div>
    <Link to="/orders" className="text-sm text-primary hover:underline">查看全部 →</Link>
</CardHeader>
```

**Step 6: 更新 Dashboard/index.jsx（2/3 + 1/3 grid）**

```jsx
// 將 grid 改為：
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2">
        <OrderStatusCard orders={stats?.orders} />
    </div>
    <StockAlertCard lowStock={stats?.products?.low_stock || 0} />
</div>
```

**Step 7: Commit**

```bash
git add server/routes/stats.js src/pages/Dashboard/
git commit -m "feat: redesign dashboard with animated KPI counters, CSS status bar chart, and week trends"
```

---

## Task 7: Orders 頁面（pill tabs + delete confirm dialog）

**Files:**
- Modify: `src/pages/Orders/OrderFilters.jsx`
- Modify: `src/pages/Orders/index.jsx`
- Modify: `src/pages/Orders/OrderTable.jsx`

**Step 1: 讀現有 OrderFilters.jsx**

```bash
cat src/pages/Orders/OrderFilters.jsx
```

**Step 2: 重寫 OrderFilters.jsx（pill tabs + search input）**

```jsx
// src/pages/Orders/OrderFilters.jsx
import { Search } from 'lucide-react';

const STATUS_TABS = [
    { value: '', label: '全部' },
    { value: 'pending', label: '待處理' },
    { value: 'processing', label: '處理中' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
];

function OrderFilters({ statusFilter, onFilterChange, search, onSearchChange, orders = [] }) {
    const getCount = (status) => status ? orders.filter(o => o.status === status).length : orders.length;

    return (
        <div className="space-y-3">
            {/* Pill tabs */}
            <div className="flex flex-wrap gap-2">
                {STATUS_TABS.map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => onFilterChange(value)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 cursor-pointer ${
                            statusFilter === value
                                ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                        }`}
                    >
                        {label}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            statusFilter === value
                                ? 'bg-white/20 text-white'
                                : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                        }`}>
                            {getCount(value)}
                        </span>
                    </button>
                ))}
            </div>
            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    placeholder="搜尋客戶名稱或訂單編號..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-[var(--radius)] bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>
        </div>
    );
}

export default OrderFilters;
```

**Step 3: 更新 Orders/index.jsx**

加 search state + delete confirm state：

```jsx
const [search, setSearch] = useState('');
const [deleteConfirm, setDeleteConfirm] = useState(null); // orderId to delete
```

改 `handleDelete`：
```jsx
const handleDelete = (id) => setDeleteConfirm(id);

const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
        await fetch(`/api/orders/${deleteConfirm}`, { method: 'DELETE' });
        toast.success('訂單已刪除');
        fetchData();
    } catch { toast.error('刪除訂單失敗'); }
    finally { setDeleteConfirm(null); }
};
```

更新 render：
```jsx
// filteredOrders
const filteredOrders = orders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return o.customer_name?.toLowerCase().includes(q) || String(o.id).padStart(4, '0').includes(q);
});

// OrderFilters — 傳 allOrders 俾佢計 tab counts
<OrderFilters
    statusFilter={statusFilter}
    onFilterChange={(status) => { setStatusFilter(status); setSearch(''); }}
    search={search}
    onSearchChange={setSearch}
    orders={orders}  // 全部 orders 俾計 count
/>
<OrderTable orders={filteredOrders} ... />

// Delete confirm dialog
{deleteConfirm && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-card rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-500 text-lg">!</span>
                </div>
                <div>
                    <h3 className="font-semibold">確定要刪除訂單？</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">此操作無法復原。</p>
                </div>
            </div>
            <div className="flex gap-2 justify-end">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm rounded-[var(--radius)] border border-input hover:bg-accent transition-colors cursor-pointer">取消</button>
                <button onClick={confirmDelete} className="px-4 py-2 text-sm rounded-[var(--radius)] bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors cursor-pointer">確認刪除</button>
            </div>
        </div>
    </div>
)}
```

注意：`statusFilter` 仍然傳去 API (`?status=xxx`)，但 pill tab count 係 client-side 計算。

**Step 4: 測試**

確認 pill tabs 顯示各狀態數量，search 正常 filter，刪除有確認 dialog。

**Step 5: Commit**

```bash
git add src/pages/Orders/
git commit -m "feat: redesign orders page with pill tabs, search filter, and delete confirmation dialog"
```

---

## Task 8: Customers 頁面（avatar initials + 訂單數欄）

**Files:**
- Modify: `server/routes/customers.js` (加 order_count + GET /:id/orders)
- Modify: `src/pages/Customers/CustomerTable.jsx`

**Step 1: 讀現有 customers route**

```bash
cat server/routes/customers.js
```

**Step 2: 更新 GET / 返回 order_count**

改 `GET /` query 加 order count JOIN：

```js
// 喺 router.get('/', ...) 入面改 query：
const customers = db.prepare(`
    SELECT c.*, COUNT(o.id) as order_count
    FROM customers c
    LEFT JOIN orders o ON o.customer_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
`).all();
```

**Step 3: 加 GET /:id/orders endpoint**

```js
// 加喺 export default 之前
router.get('/:id/orders', (req, res) => {
    try {
        const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        const orders = db.prepare(`
            SELECT o.id, o.status, o.total, o.created_at, o.notes,
                   COUNT(oi.id) as item_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.customer_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `).all(req.params.id);

        res.json({ customer, orders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

**Step 4: 讀現有 CustomerTable.jsx**

```bash
cat src/pages/Customers/CustomerTable.jsx
```

**Step 5: 更新 CustomerTable.jsx（avatar initials + order_count column）**

加 avatar initials helper：
```js
const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
```

更新 table columns（加 avatar + 訂單數）：
```jsx
// TableHead 加 "訂單數" column
<TableHead className="text-center">訂單數</TableHead>

// TableRow 改 name cell：
<TableCell>
    <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {getInitials(customer.name)}
        </div>
        <span className="font-medium">{customer.name}</span>
    </div>
</TableCell>

// 加 order_count cell：
<TableCell className="text-center font-mono">{customer.order_count ?? 0}</TableCell>
```

**Step 6: Commit**

```bash
git add server/routes/customers.js src/pages/Customers/CustomerTable.jsx
git commit -m "feat: add order count to customers table and customer orders endpoint"
```

---

## Task 9: Products 頁面（stock status dots）

**Files:**
- Modify: `src/pages/Products/ProductTable.jsx`

**Step 1: 讀現有 ProductTable.jsx**

```bash
cat src/pages/Products/ProductTable.jsx
```

**Step 2: 加 stock status dot logic**

```jsx
// 加 helper function：
const getStockStatus = (stock) => {
    if (stock < 5) return { label: '極低', dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400' };
    if (stock < 10) return { label: '偏低', dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' };
    return { label: '正常', dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' };
};

// 在 stock column 加狀態：
const stockStatus = getStockStatus(product.stock);
<TableCell>
    <div className="flex items-center gap-2">
        <span>{product.stock}</span>
        <span className={`inline-flex items-center gap-1 text-xs ${stockStatus.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${stockStatus.dot}`} />
            {stockStatus.label}
        </span>
    </div>
</TableCell>
```

**Step 3: Commit**

```bash
git add src/pages/Products/ProductTable.jsx
git commit -m "feat: add stock severity indicators to products table"
```

---

## Task 10: Animations + Micro-interactions

**Files:**
- Modify: `src/index.css` (加 animation utilities)
- Modify: `src/components/ui/Button.jsx` (hover + press)
- Modify: `src/App.jsx` (page fade-in)

**Step 1: 加 CSS animation utilities 落 index.css**

喺 index.css 尾部加：

```css
/* Animations */
@keyframes fade-in {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes modal-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}

.animate-fade-in {
    animation: fade-in 0.2s ease forwards;
}

.animate-modal-in {
    animation: modal-in 0.2s ease forwards;
}
```

**Step 2: 更新 Button.jsx（press scale + transition）**

加 `active:scale-[0.98]` 同 `transition-all duration-150` 到 base classes：

```jsx
className={cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius)] text-sm font-medium transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
    variants[variant],
    sizes[size],
    className
)}
```

**Step 3: 加 page fade-in transition**

喺 `src/components/Layout.jsx` 嘅 `<main>` content wrapper 加 class：

```jsx
// 喺 Outlet 外包一層 div
<main className="flex-1 overflow-auto p-6">
    <ToastProvider>
        <div key={location.pathname} className="animate-fade-in">
            <Outlet />
        </div>
    </ToastProvider>
</main>
```

**Step 4: 加 modal animation 落 Orders/index.jsx 同 Customers/index.jsx 嘅 modal wrappers**

所有 modal dialog `<div>` 加 `animate-modal-in` class：
```jsx
<div className="bg-card rounded-xl shadow-2xl ... animate-modal-in">
```

**Step 5: Commit**

```bash
git add src/index.css src/components/ui/Button.jsx src/components/Layout.jsx src/pages/Orders/index.jsx src/pages/Customers/index.jsx src/pages/Products/index.jsx
git commit -m "feat: add page fade-in, button press scale, and modal animations"
```

---

## Task 11: Final Push + README Update

**Step 1: 確認 build 無 error**

```bash
npm run build
```

**Step 2: 更新 README tech stack**

喺 README.md 更新樣式欄位：
- `Vanilla CSS (深色主題)` → `Tailwind CSS v4 + Zinc/Indigo design system (light/dark)`

**Step 3: Commit + Push**

```bash
git add README.md
git commit -m "docs: update README with current tech stack"
git push origin main
```

---

## Summary

| Task | 改動 | 難度 |
|------|------|------|
| 1 | Git sync + commit refactoring | 易 |
| 2 | Design tokens + Geist Sans | 易 |
| 3 | StatusBadge + Toast 重設計 | 中 |
| 4 | Header page title + glassmorphism | 易 |
| 5 | Sidebar search + badges + user profile | 中 |
| 6 | Dashboard KPI counter + CSS bar chart | 中 |
| 7 | Orders pill tabs + search + delete confirm | 中 |
| 8 | Customers avatar + order count | 易 |
| 9 | Products stock dots | 易 |
| 10 | Animations + micro-interactions | 易 |
| 11 | Build check + push | 易 |
