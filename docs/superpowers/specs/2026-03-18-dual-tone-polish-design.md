# Dual-Tone Polish UI Redesign

**Date:** 2026-03-18
**Status:** Approved
**Inspiration:** 21st.dev component marketplace

## Overview

Complete UI upgrade for Order Management System using "Dual-Tone Polish" aesthetic — refined light + dark mode with Zinc + Indigo color system, inspired by 21st.dev's best components.

## 1. Design Tokens & Color System

### Typography
- Font: **Geist Sans** (Vercel) — replace Inter
- Load via Google Fonts: `https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap`
- Headings: `font-weight: 600`
- Body: `font-weight: 400`

### Token Migration Strategy
The existing `index.css` uses HSL-based CSS variables (e.g. `--primary: 240 5.9% 10%`). All `:root` and `.dark` HSL custom properties must be **replaced** with the new Zinc/Indigo values in HSL form. The `@theme` block must also be updated. Components using `bg-primary`, `text-muted-foreground`, etc. will automatically pick up new colors through the updated CSS variables — no component-level color changes needed.

### Border Radius
- Change `--radius` from `0.625rem` to `0.75rem` (12px)

### Light Mode (HSL values for CSS variables)
| Token | Value | Hex |
|-------|-------|-----|
| background | zinc-50 | #fafafa |
| card | white | #ffffff |
| primary | indigo-600 | #4f46e5 |
| primary-foreground | white | #ffffff |
| foreground | zinc-900 | #18181b |
| muted | zinc-100 | #f4f4f5 |
| muted-foreground | zinc-500 | #71717a |
| border | zinc-200 | #e4e4e7 |
| input | zinc-200 | #e4e4e7 |
| destructive | red-600 | #dc2626 |
| radius | 0.75rem | 12px |

### Dark Mode
| Token | Value | Hex |
|-------|-------|-----|
| background | zinc-950 | #09090b |
| card | zinc-900 | #18181b |
| primary | indigo-400 | #818cf8 |
| primary-foreground | zinc-950 | #09090b |
| foreground | zinc-50 | #fafafa |
| muted | zinc-800 | #27272a |
| muted-foreground | zinc-400 | #a1a1aa |
| border | zinc-800 | #27272a |
| input | zinc-800 | #27272a |
| destructive | red-400 | #f87171 |

### Status Colors (shared)
| Status | Light | Dark |
|--------|-------|------|
| Pending | amber-500 #f59e0b | amber-400 #fbbf24 |
| Processing | blue-500 #3b82f6 | blue-400 #60a5fa |
| Completed | emerald-500 #10b981 | emerald-400 #34d399 |
| Cancelled | red-500 #ef4444 | red-400 #f87171 |

## 2. Sidebar

### Structure
- Logo + app name ("OMS Pro") at top
- Search bar with magnifying glass icon
- Nav items: Dashboard, Orders (badge: pending count), Customers, Products (badge: low stock warning)
- Separator
- Settings (non-navigable button, no `/settings` route — placeholder for future)
- Bottom: User profile area (avatar initials + name) — **hardcoded** using same "KL" / "Kenneth" data currently in Layout.jsx header

### Dimensions
- Expanded: 256px, Collapsed: 64px
- Collapse toggle button

### States
- Active: `bg-indigo-50 text-indigo-600` (light) / `bg-indigo-950/50 text-indigo-400` (dark)
- Hover: `bg-zinc-100` (light) / `bg-zinc-800` (dark), 150ms transition
- Badge counts: pill shape `bg-zinc-200 text-zinc-700` (light) / `bg-zinc-700 text-zinc-300` (dark)

### Collapsed behavior
- Search becomes icon-only button
- Badges become dot indicators
- User area shows only avatar

## 3. Header

### Structure
- Left: Page title (large) + subtitle (muted small text)
- Right: Notification bell (red dot), Dark mode toggle, User avatar (small)
- Search **removed** from Layout.jsx header (moved to sidebar)

### Page Title Ownership
All pages currently render their own `<h1>` heading. With this redesign, **remove the per-page headings** from Dashboard.jsx, Orders.jsx, Customers.jsx, Products.jsx. The header in Layout.jsx will render page titles based on the current route using `useLocation()`.

### Style
- Height: `h-16`, sticky top
- Glassmorphism: `bg-white/80 backdrop-blur-sm border-b` (light) / `bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800` (dark)

### Page Titles
| Route | Title | Subtitle |
|-------|-------|----------|
| `/` | 儀表板 | 訂單管理系統總覽 |
| `/orders` | 訂單管理 | 管理所有訂單及狀態 |
| `/customers` | 客戶管理 | 管理客戶資訊及聯絡方式 |
| `/products` | 產品管理 | 管理產品目錄及庫存 |

## 4. Dashboard Page

### KPI Cards Row (4 columns)
- Icon in circle container (`bg-indigo-50 text-indigo-600`)
- Animated counter (0 → target, 800ms, easeOutCubic, requestAnimationFrame)
- Trend badge: green ↑ / red ↓ / gray → (pill shape)
- Cards: `bg-white border border-zinc-200 rounded-xl shadow-sm`
- Metrics: 總訂單, 總收入, 客戶數, 產品數

### Order Status Distribution (new)
- Horizontal bar chart (CSS-only, no chart library)
- Bars use status colors (amber/blue/emerald/red)
- Percentage labels on right

### Low Stock Alert
- Red dot = critical (<5), Yellow dot = low (5-10)
- "查看全部" link to Products page

### Recent Orders
- Compact table showing last 5 orders
- Status as colored dot + text
- "查看全部" link to Orders page

### Layout Grid
- Row 1: KPI cards (4 columns)
- Row 2: Order Status Distribution (2/3) + Low Stock Alert (1/3)
- Row 3: Recent Orders (full width)

## 5. Orders Page

### Filter Bar
- Pill tabs: 全部 / 待處理 / 處理中 / 已完成 / 已取消
- Each pill shows count badge — counts derived client-side from fetched orders array (filter + length), no new API endpoint needed
- Active: `bg-indigo-600 text-white` / Inactive: `bg-zinc-100 text-zinc-600`
- Below: Search input + "新增訂單" button

### Table (Invoice style)
- Columns: 訂單編號 (#ORD-xxx, font-mono), 客戶, 狀態 (dot + text), 金額 (font-mono, right-aligned), 日期, Actions (···)
- Note: Checkbox column removed — no batch actions in this scope
- Row hover: `bg-zinc-50` (light) / `bg-zinc-800/50` (dark)
- Actions dropdown: 查看詳情, 更新狀態, 刪除

### Pagination
- Left: "顯示 1-10 / 共 58 筆"
- Right: Previous / page numbers / Next

### Create Order Modal
- Backdrop: `bg-black/50 backdrop-blur-sm`
- Dialog: `bg-white rounded-xl shadow-2xl max-w-lg`
- Fields: Customer select, Order items table (product + quantity + subtotal), Add item button, Notes textarea
- Total display at bottom
- Buttons: 取消 (ghost) + 確認建立 (indigo)

### Delete Confirmation Dialog
- Warning icon + message "確定要刪除訂單？此操作無法復原。"
- Buttons: 取消 + 確認刪除 (red destructive)

## 6. Customers & Products Pages

### Shared Layout
- Search input + "新增" button
- Table
- Pagination

### Customers Table
- Columns: 客戶名稱 (with avatar initials circle, `bg-indigo-100 text-indigo-700`), 電郵, 電話, 訂單數 (font-mono centered), Actions
- Actions: 編輯, 刪除

### Products Table
- Columns: 產品名稱, 描述, 價格 (font-mono right-aligned), 庫存, 狀態, Actions
- Stock status: ● 正常 (emerald, >10), ● 偏低 (amber, 5-10), ● 極低 (red, <5)
- Note: StatusBadge.jsx must update from current `green/yellow` to `emerald/amber` Tailwind hues
- Actions: 編輯, 刪除

### Shared Modal Pattern
- Same backdrop + animation as Orders modal
- Input style: `border-zinc-300 focus:ring-2 focus:ring-indigo-500`
- Required fields marked with red `*`
- Error messages in red below inputs

## 7. Toast Notifications

### Types & Colors
- Success: `bg-emerald-50 border-emerald-200 text-emerald-800` (light) / `bg-emerald-950 border-emerald-800 text-emerald-200` (dark)
- Error: `bg-red-50 border-red-200 text-red-800` / `bg-red-950 border-red-800 text-red-200`
- Warning: `bg-amber-50 border-amber-200 text-amber-800` / `bg-amber-950 border-amber-800 text-amber-200`

### Behavior
- Position: **top-right** (change from current bottom-right) — requires full position + animation rewrite of Toast.jsx
- Enter: slide-in from top + fade-in
- Stacking: vertical, 8px gap
- Auto dismiss: success 3s, warning 5s, error **manual only** (change from current uniform 3s) — requires updating `addToast` logic to accept type-based durations
- Left border: 3px solid accent color
- Undo button: **client-side timed cancel** — delay actual API call by 3s, cancel if undo pressed. No backend undo endpoint needed.
- Exit: fade-out + slide-right, 200ms

## 8. Animations & Micro-interactions

All CSS-only or simple JS. No Framer Motion / Motion library.

| Element | Animation | Duration |
|---------|-----------|----------|
| Page transition | Content fade-in | 200ms |
| KPI counter | Number scroll (requestAnimationFrame) | 800ms |
| Table row hover | bg color transition | 150ms |
| Actions dropdown | Scale-in from top-right | 150ms |
| Modal open | Backdrop fade + dialog scale(0.95→1) + opacity | 200ms |
| Modal close | Reverse | 150ms |
| Sidebar expand/collapse | Width transition | 200ms |
| Nav item hover | bg color transition | 150ms |
| Badge count update | Pulse scale(1→1.15→1) | 300ms |
| Button hover | bg color shift | 150ms |
| Button press | scale(0.98) | 75ms |
| Button loading | Content → spinner + "處理中..." | instant |
| Dark mode toggle | Icon rotate (Sun↔Moon) | 300ms |
| Toast enter | Slide-in top + fade-in | 200ms |
| Toast exit | Fade-out + slide-right | 200ms |

## Tech Constraints

- **No new dependencies** for UI (no shadcn, Radix, Framer Motion)
- **Geist Sans** loaded via CDN or @font-face
- **CSS variables** for all theming tokens
- **Tailwind CSS v4** for all styling
- **lucide-react** for icons (already installed)
- **Pure CSS** for bar charts and progress bars
- **requestAnimationFrame** for number counter animation
