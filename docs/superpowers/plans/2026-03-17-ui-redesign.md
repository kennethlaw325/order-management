# UI Redesign — Kimi Visual Reference Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign order-management frontend to match Kimi enterprise visual style with light/dark theme support, keeping React JSX + React Router + fetch API architecture.

**Architecture:** CSS variables for theming, lightweight JSX UI components (Card, Button, Badge, Input, Table), collapsible sidebar, redesigned header with dark mode toggle. All pages restyled with Card-wrapped layouts.

**Tech Stack:** React 19, Vite 7, Tailwind CSS v4 (`@tailwindcss/vite`), clsx (already installed), lucide-react

**Spec:** `docs/superpowers/specs/2026-03-17-ui-redesign-design.md`

---

## File Structure

### New files
- `src/components/ui/Card.jsx` — Card, CardHeader, CardTitle, CardDescription, CardContent
- `src/components/ui/Button.jsx` — Button with variant/size props
- `src/components/ui/Badge.jsx` — Badge with variant props
- `src/components/ui/Input.jsx` — Styled input with forwardRef
- `src/components/ui/Table.jsx` — Table, TableHeader, TableBody, TableRow, TableHead, TableCell
- `src/components/ui/index.js` — Barrel export

### Modified files
- `src/index.css` — CSS variables (light + dark), base layer styles
- `src/utils.js` — Add `cn()` helper
- `src/components/Layout.jsx` — New header with search, dark mode, notifications, avatar
- `src/components/Sidebar.jsx` — Collapsible sidebar with CSS variable styling
- `src/components/Toast.jsx` — CSS variable styling
- `src/pages/Dashboard.jsx` — KPI cards + Kimi layout
- `src/pages/Orders.jsx` — Card-wrapped table + filter buttons + styled modal
- `src/pages/Products.jsx` — Stats cards + Card-wrapped table + styled modals
- `src/pages/Customers.jsx` — Stats cards + Card-wrapped table + styled modal

---

## Task 1: CSS Variables + Base Styles

**Files:**
- Modify: `src/index.css`
- Modify: `src/utils.js`

- [ ] **Step 1: Rewrite `src/index.css`**

Replace entire file with CSS variables + Tailwind v4 theme integration:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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

:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 10%;
  --radius: 0.625rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 240 4.9% 83.9%;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
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

- [ ] **Step 2: Add `cn()` to `src/utils.js`**

Add at top of file:

```js
import { clsx } from 'clsx';
export const cn = (...inputs) => clsx(inputs);
```

- [ ] **Step 3: Verify dev server loads without errors**

Run: check http://localhost:5173 — page should render with white background, dark text.

- [ ] **Step 4: Commit**

```
feat: add CSS variable theming system with light/dark support
```

---

## Task 2: UI Components

**Files:**
- Create: `src/components/ui/Card.jsx`
- Create: `src/components/ui/Button.jsx`
- Create: `src/components/ui/Badge.jsx`
- Create: `src/components/ui/Input.jsx`
- Create: `src/components/ui/Table.jsx`
- Create: `src/components/ui/index.js`

- [ ] **Step 1: Create `src/components/ui/Card.jsx`**

```jsx
import { cn } from '../../utils';

export function Card({ className, ...props }) {
    return <div className={cn('rounded-[var(--radius)] border border-border bg-card text-card-foreground shadow-sm', className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
    return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
    return <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
    return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export function CardContent({ className, ...props }) {
    return <div className={cn('p-6 pt-0', className)} {...props} />;
}
```

- [ ] **Step 2: Create `src/components/ui/Button.jsx`**

```jsx
import { forwardRef } from 'react';
import { cn } from '../../utils';

const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3 text-sm',
    icon: 'h-10 w-10',
};

export const Button = forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
});
Button.displayName = 'Button';
```

- [ ] **Step 3: Create `src/components/ui/Badge.jsx`**

```jsx
import { cn } from '../../utils';

const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'text-foreground border border-input',
    destructive: 'bg-destructive text-destructive-foreground',
};

export function Badge({ className, variant = 'default', ...props }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
                variants[variant],
                className
            )}
            {...props}
        />
    );
}
```

- [ ] **Step 4: Create `src/components/ui/Input.jsx`**

```jsx
import { forwardRef } from 'react';
import { cn } from '../../utils';

export const Input = forwardRef(({ className, ...props }, ref) => {
    return (
        <input
            ref={ref}
            className={cn(
                'flex h-10 w-full rounded-[var(--radius)] border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        />
    );
});
Input.displayName = 'Input';
```

- [ ] **Step 5: Create `src/components/ui/Table.jsx`**

```jsx
import { cn } from '../../utils';

export function Table({ className, ...props }) {
    return (
        <div className="relative w-full overflow-auto">
            <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
        </div>
    );
}

export function TableHeader({ className, ...props }) {
    return <thead className={cn('[&_tr]:border-b', className)} {...props} />;
}

export function TableBody({ className, ...props }) {
    return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

export function TableRow({ className, ...props }) {
    return <tr className={cn('border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', className)} {...props} />;
}

export function TableHead({ className, ...props }) {
    return <th className={cn('h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0', className)} {...props} />;
}

export function TableCell({ className, ...props }) {
    return <td className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)} {...props} />;
}
```

- [ ] **Step 6: Create `src/components/ui/index.js`**

```js
export { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';
export { Button } from './Button';
export { Badge } from './Badge';
export { Input } from './Input';
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table';
```

- [ ] **Step 7: Verify dev server — no import errors**

- [ ] **Step 8: Commit**

```
feat: add lightweight UI components (Card, Button, Badge, Input, Table)
```

---

## Task 3: Layout + Sidebar + Header

**Files:**
- Modify: `src/components/Sidebar.jsx`
- Modify: `src/components/Layout.jsx`

- [ ] **Step 1: Rewrite `src/components/Sidebar.jsx`**

Collapsible sidebar with CSS variable theming, localStorage persistence, React Router NavLink:

```jsx
import { useState, useEffect } from 'react';
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

function Sidebar() {
    const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', collapsed);
    }, [collapsed]);

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
                <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className={cn('h-8 w-8', collapsed && 'absolute -right-4 top-5 bg-card border shadow-sm')}>
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
```

- [ ] **Step 2: Rewrite `src/components/Layout.jsx`**

New header with search, dark mode toggle, notification bell, user avatar:

```jsx
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

    // Listen for sidebar changes from Sidebar component
    useEffect(() => {
        const handler = () => setSidebarCollapsed(localStorage.getItem('sidebarCollapsed') === 'true');
        window.addEventListener('storage', handler);
        // Also poll for same-tab changes
        const interval = setInterval(() => {
            const val = localStorage.getItem('sidebarCollapsed') === 'true';
            if (val !== sidebarCollapsed) setSidebarCollapsed(val);
        }, 100);
        return () => { window.removeEventListener('storage', handler); clearInterval(interval); };
    }, [sidebarCollapsed]);

    // Dark mode
    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar />
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
```

- [ ] **Step 3: Verify — sidebar collapses, dark mode toggles, layout responsive**

- [ ] **Step 4: Commit**

```
feat: collapsible sidebar + new header with dark mode toggle
```

---

## Task 4: Toast Component Update

**Files:**
- Modify: `src/components/Toast.jsx`

- [ ] **Step 1: Update Toast styling to use CSS variables**

Change the `config` object and container classes to use theme-aware colors:

```jsx
// Replace the config object (line 43-47):
const config = {
    success: { icon: CheckCircle, cls: 'bg-green-600 dark:bg-green-700' },
    error: { icon: XCircle, cls: 'bg-destructive' },
    warning: { icon: AlertTriangle, cls: 'bg-yellow-500 dark:bg-yellow-600' },
};
```

- [ ] **Step 2: Commit**

```
style: update Toast to support dark mode
```

---

## Task 5: Dashboard Page

**Files:**
- Modify: `src/pages/Dashboard.jsx`

- [ ] **Step 1: Rewrite Dashboard with Kimi-style KPI cards and layout**

```jsx
import { useState, useEffect } from 'react';
import { Package, DollarSign, Users, Tag, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, getStatusLabel, formatDate } from '../utils';
import { useToast } from '../components/Toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        fetch('/api/stats')
            .then(r => r.json())
            .then(setStats)
            .catch(() => toast.error('無法載入統計資料'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;
    }

    const statCards = [
        { label: '總訂單數', value: stats?.orders?.total || 0, icon: Package, trend: '+12.5%', positive: true },
        { label: '總收入（已完成）', value: formatCurrency(stats?.revenue || 0), icon: DollarSign, trend: '+8.2%', positive: true },
        { label: '客戶數', value: stats?.customers || 0, icon: Users, trend: '+5.1%', positive: true },
        { label: '產品數', value: stats?.products?.total || 0, icon: Tag, trend: '-2.1%', positive: false },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">儀表板</h1>
                <p className="text-muted-foreground mt-1">訂單系統總覽</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map(({ label, value, icon: Icon, trend, positive }) => (
                    <Card key={label}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{label}</CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{value}</div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                {positive
                                    ? <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                                    : <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                                }
                                <span className={positive ? 'text-green-500' : 'text-red-500'}>{trend}</span>
                                <span className="ml-1">較上週</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Body Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">訂單狀態</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-3">
                            {[
                                { status: 'pending', label: '待處理', cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
                                { status: 'processing', label: '處理中', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
                                { status: 'completed', label: '已完成', cls: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
                                { status: 'cancelled', label: '已取消', cls: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
                            ].map(({ status, label, cls }) => (
                                <div key={status} className="flex items-center justify-between">
                                    <Badge className={cls}>{label}</Badge>
                                    <span className="text-sm font-semibold">{stats?.orders?.[status] || 0}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Stock Alert */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            庫存警示
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats?.products?.low_stock > 0 ? (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <div>
                                    <div className="text-sm font-semibold">{stats.products.low_stock} 件商品庫存不足</div>
                                    <div className="text-xs text-muted-foreground">庫存低於 10 件</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-sm text-muted-foreground">所有商品庫存充足</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">近期訂單</CardTitle>
                    <CardDescription>最近的訂單記錄</CardDescription>
                </CardHeader>
                <CardContent>
                    {stats?.recentOrders?.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>訂單編號</TableHead>
                                    <TableHead>客戶</TableHead>
                                    <TableHead>金額</TableHead>
                                    <TableHead>狀態</TableHead>
                                    <TableHead>時間</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.recentOrders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium text-primary">#{String(order.id).padStart(4, '0')}</TableCell>
                                        <TableCell className="text-muted-foreground">{order.customer_name || '—'}</TableCell>
                                        <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                                        <TableCell><StatusBadge status={order.status} /></TableCell>
                                        <TableCell className="text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="py-12 text-center text-sm text-muted-foreground">尚無訂單記錄</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function StatusBadge({ status }) {
    const config = {
        pending: { label: '待處理', cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
        processing: { label: '處理中', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
        completed: { label: '已完成', cls: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
        cancelled: { label: '已取消', cls: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
    };
    const { label, cls } = config[status] || config.pending;
    return <Badge className={cls}>{label}</Badge>;
}

export default Dashboard;
```

- [ ] **Step 2: Verify Dashboard renders with new card layout, dark mode works**

- [ ] **Step 3: Commit**

```
feat: redesign Dashboard with Kimi-style KPI cards and layout
```

---

## Task 6: Orders Page

**Files:**
- Modify: `src/pages/Orders.jsx`

- [ ] **Step 1: Rewrite Orders page with Card-wrapped table, filter buttons, styled modal**

Full rewrite using UI components. Key changes:
- Page header: `text-3xl font-bold tracking-tight`
- Status filter: Button group (全部/待處理/處理中/已完成/已取消) replacing `<select>`
- Table: Card-wrapped with UI Table components
- Modal: styled with Card background, Input components, Button components
- StatusBadge and ActionBtn use CSS variables
- All hardcoded gray/indigo classes → CSS variable equivalents

```jsx
import { useState, useEffect } from 'react';
import { Plus, X, Trash2, Package } from 'lucide-react';
import { formatCurrency, getStatusLabel, formatDate } from '../utils';
import { useToast } from '../components/Toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [formData, setFormData] = useState({ customer_id: '', notes: '', items: [{ product_id: '', quantity: 1 }] });
    const toast = useToast();

    useEffect(() => { fetchData(); }, [statusFilter]);

    const fetchData = async () => {
        try {
            const [o, c, p] = await Promise.all([
                fetch(`/api/orders${statusFilter ? `?status=${statusFilter}` : ''}`).then(r => r.json()),
                fetch('/api/customers').then(r => r.json()),
                fetch('/api/products').then(r => r.json()),
            ]);
            setOrders(o); setCustomers(c); setProducts(p);
        } catch { toast.error('無法載入訂單資料'); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validItems = formData.items.filter(i => i.product_id && i.quantity > 0);
        if (!validItems.length) { toast.warning('請至少選擇一個產品'); return; }
        try {
            const res = await fetch('/api/orders', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customer_id: formData.customer_id || null, notes: formData.notes, items: validItems.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) })) })
            });
            if (!res.ok) { const d = await res.json(); toast.error(d.error || '建立訂單失敗'); return; }
            toast.success('訂單建立成功'); fetchData(); setShowModal(false);
        } catch { toast.error('建立訂單失敗'); }
    };

    const updateStatus = async (id, status) => {
        try {
            const res = await fetch(`/api/orders/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
            if (!res.ok) { const d = await res.json(); toast.error(d.error || '操作失敗'); return; }
            toast.success('訂單狀態已更新'); fetchData();
        } catch { toast.error('更新狀態失敗'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('確定要刪除此訂單嗎？')) return;
        try { await fetch(`/api/orders/${id}`, { method: 'DELETE' }); toast.success('訂單已刪除'); fetchData(); }
        catch { toast.error('刪除訂單失敗'); }
    };

    const openModal = () => { setFormData({ customer_id: '', notes: '', items: [{ product_id: '', quantity: 1 }] }); setShowModal(true); };
    const addItem = () => setFormData({ ...formData, items: [...formData.items, { product_id: '', quantity: 1 }] });
    const removeItem = (i) => { if (formData.items.length > 1) setFormData({ ...formData, items: formData.items.filter((_, idx) => idx !== i) }); };
    const updateItem = (i, field, value) => { const items = [...formData.items]; items[i][field] = value; setFormData({ ...formData, items }); };
    const total = formData.items.reduce((s, i) => { const p = products.find(x => x.id === parseInt(i.product_id)); return s + (p ? p.price * i.quantity : 0); }, 0);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;

    const filters = [
        { value: '', label: '全部' },
        { value: 'pending', label: '待處理' },
        { value: 'processing', label: '處理中' },
        { value: 'completed', label: '已完成' },
        { value: 'cancelled', label: '已取消' },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">訂單管理</h1>
                    <p className="text-muted-foreground mt-1">管理與追蹤您的訂單</p>
                </div>
                <Button onClick={openModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    新增訂單
                </Button>
            </div>

            {/* Filter Buttons */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex gap-2">
                        {filters.map(f => (
                            <Button
                                key={f.value}
                                variant={statusFilter === f.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter(f.value)}
                            >
                                {f.label}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Order Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">訂單列表</CardTitle>
                    <CardDescription>共 {orders.length} 筆訂單</CardDescription>
                </CardHeader>
                <CardContent>
                    {orders.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>訂單編號</TableHead>
                                    <TableHead>客戶</TableHead>
                                    <TableHead>金額</TableHead>
                                    <TableHead>狀態</TableHead>
                                    <TableHead>建立時間</TableHead>
                                    <TableHead>操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium text-primary">#{String(order.id).padStart(4, '0')}</TableCell>
                                        <TableCell className="text-muted-foreground">{order.customer_name || '—'}</TableCell>
                                        <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                                        <TableCell><StatusBadge status={order.status} /></TableCell>
                                        <TableCell className="text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {order.status === 'pending' && <Button variant="outline" size="sm" onClick={() => updateStatus(order.id, 'processing')}>開始處理</Button>}
                                                {order.status === 'processing' && <Button size="sm" onClick={() => updateStatus(order.id, 'completed')}>完成</Button>}
                                                {(order.status === 'pending' || order.status === 'processing') && <Button variant="destructive" size="sm" onClick={() => updateStatus(order.id, 'cancelled')}>取消</Button>}
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(order.id)} className="h-8 w-8">
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12">
                            <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mt-2 text-sm font-medium">{statusFilter ? '沒有符合條件的訂單' : '尚無訂單記錄'}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">點擊上方按鈕建立第一筆訂單</p>
                            <Button onClick={openModal} className="mt-4">建立第一筆訂單</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Order Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="w-full max-w-xl max-h-[90vh] overflow-auto bg-card rounded-lg border border-border shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h3 className="text-base font-semibold">新增訂單</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="h-8 w-8"><X className="w-4 h-4" /></Button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="px-6 py-5 flex flex-col gap-5">
                                <div>
                                    <label className="block text-sm font-medium mb-1">客戶</label>
                                    <select className="flex h-10 w-full rounded-[var(--radius)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={formData.customer_id} onChange={e => setFormData({ ...formData, customer_id: e.target.value })}>
                                        <option value="">選擇客戶（可選）</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">訂單項目 *</label>
                                    <div className="flex flex-col gap-3">
                                        {formData.items.map((item, i) => (
                                            <div key={i} className="grid gap-3" style={{ gridTemplateColumns: '1fr 80px 80px 36px' }}>
                                                <select className="flex h-10 w-full rounded-[var(--radius)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)} required>
                                                    <option value="">選擇產品</option>
                                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>)}
                                                </select>
                                                <Input type="number" className="text-center" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} min="1" />
                                                <div className="flex items-center text-xs font-medium text-muted-foreground">
                                                    {item.product_id && products.find(p => p.id === parseInt(item.product_id)) ? formatCurrency(products.find(p => p.id === parseInt(item.product_id)).price * item.quantity) : '—'}
                                                </div>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} disabled={formData.items.length === 1} className="h-10 w-9"><X className="w-4 h-4" /></Button>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={addItem} className="mt-3 text-xs font-medium text-primary hover:text-primary/80 bg-transparent border-none cursor-pointer">+ 新增項目</button>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">備註</label>
                                    <textarea className="flex min-h-[80px] w-full rounded-[var(--radius)] border border-input bg-background px-3 py-2 text-sm resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                                </div>
                                <div className="flex items-center justify-between px-4 py-3 rounded-[var(--radius)] bg-muted">
                                    <span className="text-sm font-medium">訂單總計</span>
                                    <span className="text-lg font-bold text-primary">{formatCurrency(total)}</span>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>取消</Button>
                                <Button type="submit">建立訂單</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }) {
    const config = {
        pending: { label: '待處理', cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
        processing: { label: '處理中', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
        completed: { label: '已完成', cls: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
        cancelled: { label: '已取消', cls: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
    };
    const { label, cls } = config[status] || config.pending;
    return <Badge className={cls}>{label}</Badge>;
}

export default Orders;
```

- [ ] **Step 2: Verify Orders page — filter buttons, table, modal all work**

- [ ] **Step 3: Commit**

```
feat: redesign Orders page with Kimi-style cards and filter buttons
```

---

## Task 7: Products Page

**Files:**
- Modify: `src/pages/Products.jsx`

- [ ] **Step 1: Rewrite Products page**

Same pattern as Orders — Card-wrapped table, stats row, styled modal. Key changes:
- Page header: `text-3xl font-bold tracking-tight` + subtitle
- Stats cards row (4-column): 總產品數, 低庫存
- Table: Card-wrapped with search in CardHeader
- Modal: Card bg, Input components, Button components
- All `bg-white`, `border-gray-*`, `text-gray-*`, `bg-indigo-*` → CSS variable classes

Follow same structure as Orders Task 6 — use `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Button`, `Badge`, `Input`, `Table*` from `../components/ui`.

- [ ] **Step 2: Verify Products page — search, add, edit, delete all work**

- [ ] **Step 3: Commit**

```
feat: redesign Products page with Kimi-style cards and table
```

---

## Task 8: Customers Page

**Files:**
- Modify: `src/pages/Customers.jsx`

- [ ] **Step 1: Rewrite Customers page**

Same pattern — Card-wrapped table, styled modal. Key changes:
- Page header style
- Table in Card with search
- Modal with Card bg, Input, Button
- All hardcoded colors → CSS variables

- [ ] **Step 2: Verify Customers page — search, add, edit, delete all work**

- [ ] **Step 3: Commit**

```
feat: redesign Customers page with Kimi-style cards and table
```

---

## Task 9: Visual QA + Final Polish

**Files:** All pages

- [ ] **Step 1: Test light mode — all 4 pages look correct**
- [ ] **Step 2: Test dark mode — all 4 pages look correct, no white flashes**
- [ ] **Step 3: Test sidebar collapse — content area adjusts, nav items show icons only**
- [ ] **Step 4: Test responsive — tables scroll horizontally, modals fit mobile**
- [ ] **Step 5: Fix any visual issues found**
- [ ] **Step 6: Final commit**

```
style: visual QA polish and dark mode fixes
```
