# Order Management System - Feature Completion Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 完成訂單管理系統的剩餘功能：commit 現有 refactor、加銷售圖表、訂單詳情頁、訂單搜尋、客戶訂單歷史。

**Architecture:** 前端 React + Vite，後端 Express + SQLite。新功能盡量用現有 API（stats 已有 salesByDay 資料），只在必要時擴充後端。用 recharts 做圖表（唔需要 D3 的複雜性）。

**Tech Stack:** React 19, Vite, Express 5, better-sqlite3, Tailwind CSS 4, Lucide React, recharts（新增）

---

## Task 1: Commit 現有 Refactoring

**Files:**
- Commit all: `src/pages/Dashboard/`, `src/pages/Orders/`, `src/pages/Customers/`, `src/pages/Products/`, `src/components/LoadingSpinner.jsx`

**Step 1: 確認所有 page 子組件正確 import**

```bash
cd C:/Users/Kenneth/Projects/order-management
git status
```

Expected: 4 deleted `.jsx` + 1 new `LoadingSpinner.jsx` + 4 new page directories

**Step 2: Commit**

```bash
git add -A
git commit -m "refactor: split pages into sub-folder components

- Dashboard → StatCards, OrderStatusCard, StockAlertCard, RecentOrdersTable
- Orders → OrderFilters, OrderTable, CreateOrderModal
- Customers → CustomerStatsCard, CustomerTable, CustomerModal
- Products → ProductStatsCards, ProductTable, ProductModal
- Add LoadingSpinner component"
```

**Step 3: 確認 build 正常**

```bash
npm run build
```

Expected: build 成功，無 error

---

## Task 2: 安裝 recharts

**Step 1: Install**

```bash
npm install recharts
```

**Step 2: 確認安裝**

```bash
node -e "require('./node_modules/recharts/package.json').version && console.log('OK')" 2>/dev/null || node -e "import('./node_modules/recharts/package.json').then(p => console.log('recharts', p.default.version))"
```

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add recharts for dashboard charts"
```

---

## Task 3: Dashboard 銷售圖表

backend 已有 `salesByDay` 資料（近 7 天每日訂單數 + 收入）。只需加前端組件。

**Files:**
- Create: `src/pages/Dashboard/SalesChart.jsx`
- Modify: `src/pages/Dashboard/index.jsx`

**Step 1: 建立 SalesChart 組件**

```jsx
// src/pages/Dashboard/SalesChart.jsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui';

const formatDay = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border bg-card p-3 shadow-sm text-sm">
            <p className="font-medium mb-1">{label}</p>
            <p className="text-muted-foreground">訂單數：<span className="text-foreground font-medium">{payload[0]?.value}</span></p>
            <p className="text-muted-foreground">收入：<span className="text-foreground font-medium">NT${payload[1]?.value?.toLocaleString()}</span></p>
        </div>
    );
};

function SalesChart({ salesByDay }) {
    const data = salesByDay?.map(d => ({
        date: formatDay(d.date),
        orders: d.order_count,
        revenue: d.revenue,
    })) || [];

    if (!data.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">近 7 日銷售趨勢</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="py-12 text-center text-sm text-muted-foreground">尚無銷售資料</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">近 7 日銷售趨勢</CardTitle>
                <CardDescription>每日訂單數與收入概覽</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                        <defs>
                            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={30} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorOrders)" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export default SalesChart;
```

**Step 2: 加入 Dashboard index.jsx**

在 `src/pages/Dashboard/index.jsx`，加 import：
```jsx
import SalesChart from './SalesChart';
```

在 `<RecentOrdersTable>` 之前加：
```jsx
<SalesChart salesByDay={stats?.salesByDay} />
```

**Step 3: 確認 dev server 正常顯示圖表**

```bash
npm run dev
```

打開 http://localhost:5173，確認 Dashboard 有圖表顯示

**Step 4: Commit**

```bash
git add src/pages/Dashboard/SalesChart.jsx src/pages/Dashboard/index.jsx
git commit -m "feat: add 7-day sales trend chart to dashboard"
```

---

## Task 4: 修正 StatCards 趨勢（用真實資料）

目前趨勢值係 hardcoded（`'+12.5%'`），要用真實數據。

**Files:**
- Modify: `server/routes/stats.js`
- Modify: `src/pages/Dashboard/StatCards.jsx`

**Step 1: 擴充 stats API — 加上週對比**

在 `server/routes/stats.js`，在 `salesByDay` query 之後、`res.json` 之前加：

```js
// This week vs last week comparison
const thisWeek = db.prepare(`
    SELECT COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue
    FROM orders
    WHERE created_at >= date('now', '-7 days') AND status != 'cancelled'
`).get();

const lastWeek = db.prepare(`
    SELECT COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue
    FROM orders
    WHERE created_at >= date('now', '-14 days')
      AND created_at < date('now', '-7 days')
      AND status != 'cancelled'
`).get();

const thisWeekCustomers = db.prepare(`
    SELECT COUNT(*) as count FROM customers
    WHERE created_at >= date('now', '-7 days')
`).get();

const lastWeekCustomers = db.prepare(`
    SELECT COUNT(*) as count FROM customers
    WHERE created_at >= date('now', '-14 days')
      AND created_at < date('now', '-7 days')
`).get();

const calcTrend = (current, previous) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous * 100).toFixed(1);
};

const trends = {
    orders: calcTrend(thisWeek.orders, lastWeek.orders),
    revenue: calcTrend(thisWeek.revenue, lastWeek.revenue),
    customers: calcTrend(thisWeekCustomers.count, lastWeekCustomers.count),
};
```

在 `res.json(...)` 加 `trends` 欄位：
```js
res.json({
    orders: orderStats,
    revenue: revenue.total_revenue,
    customers: customerCount.count,
    products: productStats,
    recentOrders,
    salesByDay,
    trends,      // 新增
});
```

**Step 2: 更新 StatCards 使用真實 trend**

```jsx
// src/pages/Dashboard/StatCards.jsx
// 改 cards array 為：
const trends = stats?.trends || {};
const cards = [
    { label: '總訂單數', value: stats?.orders?.total || 0, icon: Package, trend: trends.orders, positive: parseFloat(trends.orders) >= 0 },
    { label: '總收入（已完成）', value: formatCurrency(stats?.revenue || 0), icon: DollarSign, trend: trends.revenue, positive: parseFloat(trends.revenue) >= 0 },
    { label: '客戶數', value: stats?.customers || 0, icon: Users, trend: trends.customers, positive: parseFloat(trends.customers) >= 0 },
    { label: '產品數', value: stats?.products?.total || 0, icon: Tag, trend: null, positive: true },
];
```

同埋 render 時要 handle `trend` 為 null：
```jsx
{trend !== null ? (
    <div className="flex items-center text-xs text-muted-foreground">
        {positive
            ? <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
            : <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
        }
        <span className={positive ? 'text-green-500' : 'text-red-500'}>{trend}%</span>
        <span className="ml-1">較上週</span>
    </div>
) : (
    <div className="text-xs text-muted-foreground">全部產品</div>
)}
```

**Step 3: 測試**

啟動 dev server，確認 StatCards 顯示真實趨勢或 null 狀態正常

**Step 4: Commit**

```bash
git add server/routes/stats.js src/pages/Dashboard/StatCards.jsx
git commit -m "feat: replace hardcoded stat trends with real week-over-week data"
```

---

## Task 5: 訂單搜尋（前端 filter）

**Files:**
- Modify: `src/pages/Orders/OrderFilters.jsx`
- Modify: `src/pages/Orders/index.jsx`
- Modify: `src/pages/Orders/OrderTable.jsx`

**Step 1: 睇現有 OrderFilters.jsx**

```bash
cat src/pages/Orders/OrderFilters.jsx
```

**Step 2: 加 search input 落 OrderFilters**

```jsx
// src/pages/Orders/OrderFilters.jsx
import { Search } from 'lucide-react';
import { Input, Select } from '../../components/ui';

function OrderFilters({ statusFilter, onFilterChange, search, onSearchChange }) {
    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="搜尋客戶名稱或訂單編號..."
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>
            <Select value={statusFilter} onChange={e => onFilterChange(e.target.value)} className="w-full sm:w-40">
                <option value="">所有狀態</option>
                <option value="pending">待處理</option>
                <option value="processing">處理中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
            </Select>
        </div>
    );
}

export default OrderFilters;
```

**Step 3: 加 search state 落 Orders/index.jsx**

加 `const [search, setSearch] = useState('');`

傳 props 落 `<OrderFilters>`：
```jsx
<OrderFilters
    statusFilter={statusFilter}
    onFilterChange={setStatusFilter}
    search={search}
    onSearchChange={setSearch}
/>
```

傳 filtered orders 落 `<OrderTable>`：
```jsx
const filteredOrders = orders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
        o.customer_name?.toLowerCase().includes(q) ||
        String(o.id).padStart(4, '0').includes(q)
    );
});
// 然後 <OrderTable orders={filteredOrders} ...>
```

**Step 4: 更新 OrderTable 顯示 count**

改 `CardDescription`：
```jsx
<CardDescription>共 {orders.length} 筆訂單</CardDescription>
```
（已係 `orders.length`，自動用 filteredOrders 數量）

**Step 5: 測試**

搜尋客戶名稱同訂單編號，確認 filter 正常

**Step 6: Commit**

```bash
git add src/pages/Orders/OrderFilters.jsx src/pages/Orders/index.jsx
git commit -m "feat: add search filter to orders page"
```

---

## Task 6: 訂單詳情頁（Side Panel）

後端已有 `GET /api/orders/:id`（返回 order + items），加一個 side panel 顯示訂單詳情，唔需要新頁面。

**Files:**
- Create: `src/pages/Orders/OrderDetailPanel.jsx`
- Modify: `src/pages/Orders/index.jsx`
- Modify: `src/pages/Orders/OrderTable.jsx`

**Step 1: 建立 OrderDetailPanel 組件**

```jsx
// src/pages/Orders/OrderDetailPanel.jsx
import { X } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils';
import { Button, StatusBadge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui';

function OrderDetailPanel({ orderId, onClose }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) return;
        setLoading(true);
        fetch(`/api/orders/${orderId}`)
            .then(r => r.json())
            .then(setOrder)
            .finally(() => setLoading(false));
    }, [orderId]);

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-card border-l border-border shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-semibold text-base">
                    訂單詳情 {order ? `#${String(order.id).padStart(4, '0')}` : ''}
                </h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
                    </div>
                ) : order ? (
                    <>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">狀態</span>
                                <StatusBadge status={order.status} />
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">客戶</span>
                                <span>{order.customer_name || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">建立時間</span>
                                <span>{formatDate(order.created_at)}</span>
                            </div>
                            {order.notes && (
                                <div>
                                    <span className="text-muted-foreground">備註</span>
                                    <p className="mt-1 p-2 rounded bg-muted text-xs">{order.notes}</p>
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-medium mb-2">訂單項目</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>產品</TableHead>
                                        <TableHead className="text-right">數量</TableHead>
                                        <TableHead className="text-right">單價</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items?.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.product_name}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="pt-2 border-t border-border flex justify-between font-medium">
                            <span>總計</span>
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground">無法載入訂單資料</p>
                )}
            </div>
        </div>
    );
}

export default OrderDetailPanel;
```

記得加 import：
```jsx
import { useState, useEffect } from 'react';
```

**Step 2: 加 selectedOrderId state 落 Orders/index.jsx**

```jsx
const [selectedOrderId, setSelectedOrderId] = useState(null);
```

加 panel 顯示：
```jsx
{selectedOrderId && (
    <>
        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setSelectedOrderId(null)} />
        <OrderDetailPanel orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
    </>
)}
```

加 import：
```jsx
import OrderDetailPanel from './OrderDetailPanel';
```

傳 `onView` 落 OrderTable：
```jsx
<OrderTable ... onView={setSelectedOrderId} />
```

**Step 3: 加 View 按鈕落 OrderTable**

在 `OrderTable.jsx` 加 import：
```jsx
import { Eye, Trash2, Package } from 'lucide-react';
```

在 `function OrderTable` props 加 `onView`，在每行操作加：
```jsx
<Button variant="ghost" size="icon" onClick={() => onView(order.id)} className="h-8 w-8">
    <Eye className="h-4 w-4" />
</Button>
```

放在 Trash2 按鈕之前。

**Step 4: 測試**

點擊眼睛圖示，確認 side panel 開啟並顯示訂單項目

**Step 5: Commit**

```bash
git add src/pages/Orders/OrderDetailPanel.jsx src/pages/Orders/index.jsx src/pages/Orders/OrderTable.jsx
git commit -m "feat: add order detail side panel with items breakdown"
```

---

## Task 7: 客戶訂單歷史

客戶頁面加「查看訂單」功能，側邊 panel 顯示該客戶所有訂單。

**Files:**
- Modify: `server/routes/customers.js` — 加 `GET /api/customers/:id/orders`
- Create: `src/pages/Customers/CustomerOrdersPanel.jsx`
- Modify: `src/pages/Customers/index.jsx`
- Modify: `src/pages/Customers/CustomerTable.jsx`

**Step 1: 睇現有 customers route**

```bash
cat server/routes/customers.js
```

**Step 2: 加 customer orders endpoint**

在 `server/routes/customers.js` 加（在 `export default` 之前）：

```js
// Get orders for a specific customer
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

**Step 3: 建立 CustomerOrdersPanel**

```jsx
// src/pages/Customers/CustomerOrdersPanel.jsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils';
import { Button, StatusBadge } from '../../components/ui';

function CustomerOrdersPanel({ customerId, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!customerId) return;
        setLoading(true);
        fetch(`/api/customers/${customerId}/orders`)
            .then(r => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, [customerId]);

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-card border-l border-border shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                    <h2 className="font-semibold text-base">{data?.customer?.name || '客戶'} 的訂單</h2>
                    {data && <p className="text-xs text-muted-foreground mt-0.5">共 {data.orders.length} 筆訂單</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
                    </div>
                ) : !data?.orders?.length ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">此客戶尚無訂單</div>
                ) : (
                    <div className="divide-y divide-border">
                        {data.orders.map(order => (
                            <div key={order.id} className="p-4 hover:bg-muted/50 transition-colors">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm text-primary">
                                        #{String(order.id).padStart(4, '0')}
                                    </span>
                                    <StatusBadge status={order.status} />
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{order.item_count} 件商品</span>
                                    <span>{formatCurrency(order.total)}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{formatDate(order.created_at)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CustomerOrdersPanel;
```

**Step 4: 加 selectedCustomerId state 落 Customers/index.jsx**

```jsx
const [selectedCustomerId, setSelectedCustomerId] = useState(null);
```

加 panel + backdrop：
```jsx
import CustomerOrdersPanel from './CustomerOrdersPanel';

// 在 return 最底加：
{selectedCustomerId && (
    <>
        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setSelectedCustomerId(null)} />
        <CustomerOrdersPanel customerId={selectedCustomerId} onClose={() => setSelectedCustomerId(null)} />
    </>
)}
```

傳 `onViewOrders` 落 CustomerTable：
```jsx
<CustomerTable ... onViewOrders={setSelectedCustomerId} />
```

**Step 5: 加按鈕落 CustomerTable**

```bash
cat src/pages/Customers/CustomerTable.jsx
```

加 import `ShoppingBag`，加 `onViewOrders` prop，每行加按鈕：
```jsx
import { Pencil, Trash2, ShoppingBag } from 'lucide-react';

// 在 edit/delete 按鈕前加：
<Button variant="ghost" size="icon" onClick={() => onViewOrders(customer.id)} className="h-8 w-8" title="查看訂單">
    <ShoppingBag className="h-4 w-4" />
</Button>
```

**Step 6: 測試**

點擊客戶行的購物袋圖示，確認 panel 顯示該客戶訂單

**Step 7: Commit**

```bash
git add server/routes/customers.js src/pages/Customers/CustomerOrdersPanel.jsx src/pages/Customers/index.jsx src/pages/Customers/CustomerTable.jsx
git commit -m "feat: add customer order history panel"
```

---

## Task 8: Git Push

```bash
git push origin main
```

確認 GitHub 有所有 commits。

---

## Summary

| Task | 功能 | 估計難度 |
|------|------|---------|
| 1 | Commit refactoring | 易 |
| 2 | 安裝 recharts | 易 |
| 3 | Dashboard 銷售圖表 | 中 |
| 4 | StatCards 真實趨勢 | 中 |
| 5 | 訂單搜尋 | 易 |
| 6 | 訂單詳情 side panel | 中 |
| 7 | 客戶訂單歷史 | 中 |
| 8 | Git push | 易 |
