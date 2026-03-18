# UI Redesign — Kimi Visual Reference

## Goal

Redesign the order-management frontend UI to match the Kimi enterprise-style visual language while preserving the existing React JSX + React Router + Express/SQLite architecture.

## Non-Goals

- No TypeScript migration
- No Zustand (keep fetch-from-backend pattern)
- No shadcn/ui package installation (hand-write lightweight JSX components)
- No new pages or modules (keep Dashboard, Orders, Customers, Products)
- No backend changes

## Design Tokens (CSS Variables)

Adopt Kimi's HSL-based CSS variable system for light + dark themes.

### Light Theme (`:root`)

```css
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
```

### Dark Theme (`.dark`)

```css
--background: 240 10% 3.9%;
--foreground: 0 0% 98%;
--card: 240 10% 3.9%;
--card-foreground: 0 0% 98%;
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
```

### Dark Mode Toggle

- Toggle button in Header (Sun/Moon icon)
- Adds/removes `class="dark"` on `<html>` element
- Persisted in `localStorage` key `theme`

## UI Components (`src/components/ui/`)

Lightweight JSX wrappers using CSS variable classes. No external UI library.

### Card

```jsx
// Props: className, children
<div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-sm">
```

Subcomponents: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`

### Button

Variants: `default`, `outline`, `ghost`, `destructive`
Sizes: `default`, `sm`, `icon`

### Badge

Variants: `default`, `secondary`, `outline`, `destructive`

### Input

Styled `<input>` with focus ring using `--ring` variable.

### Table

Wrapper components: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`

## Layout Architecture

### Sidebar (`src/components/Sidebar.jsx`)

- **Collapsible**: 256px expanded ↔ 64px collapsed
- **Toggle**: ChevronLeft/ChevronRight button
- **State**: `localStorage` key `sidebarCollapsed`
- **Logo area**: Icon + "OMS Pro" text (hidden when collapsed)
- **Nav items**: Icon + label, active state uses `bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]`
- **Settings**: Bottom-pinned with border-top
- Keep `<NavLink>` from React Router

### Header (`src/components/Layout.jsx`)

- **Search bar**: Left-aligned, max-w-md, with Search icon
- **Right side**: Dark mode toggle + Notification bell (with red dot) + User avatar circle
- Height: h-16, sticky top-0

### Main Content

- `flex-1 overflow-auto p-6`
- Transition margin-left when sidebar collapses

## Page Designs

### Dashboard

**Header**: `text-3xl font-bold tracking-tight` "儀表板" + subtitle

**KPI Cards** (4-column grid):
- 總訂單數 — Package icon, trend arrow
- 總收入 — DollarSign icon, trend arrow
- 客戶數 — Users icon, trend arrow
- 產品數 — Tag icon, trend arrow

Each card: `CardHeader` (small title + icon) → `CardContent` (large number + colored trend text)

**Body** (2-column grid):
- Left: 訂單狀態 card (status rows with badges + counts)
- Right: 庫存警示 card (yellow alert panel or "充足" message)

**Recent Orders**: Card-wrapped table matching Kimi table style

### Orders

**Header**: Title + subtitle + status filter buttons (全部/待處理/處理中/已完成/已取消) + 新增訂單 button

**Table**: Card-wrapped, clean header row, hover states, StatusBadge with color coding, action buttons

**Create Modal**: Same form fields, styled with Card-like container, Input components, proper Label styling

### Products

**Header**: Title + subtitle + 新增產品 button

**Stats Cards** (4-column): 總產品數, 上架產品, 低庫存, 產品類別

**Table**: Card-wrapped with search input in header, product name + price + stock + category columns, edit/delete actions

**Add/Edit Modal**: Grid form layout, Input components, proper spacing

### Customers

**Header**: Title + subtitle + 新增客戶 button

**Stats Cards**: 總客戶數, 近期新增, etc.

**Table**: Card-wrapped with search, name + email + phone + orders count columns

**Add/Edit Modal**: Similar grid form layout

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/index.css` | **Edit** | Add CSS variables (light + dark), base styles |
| `src/components/ui/Card.jsx` | **New** | Card, CardHeader, CardTitle, CardDescription, CardContent |
| `src/components/ui/Button.jsx` | **New** | Button with variants |
| `src/components/ui/Badge.jsx` | **New** | Badge with variants |
| `src/components/ui/Input.jsx` | **New** | Styled input |
| `src/components/ui/Table.jsx` | **New** | Table wrapper components |
| `src/components/ui/index.js` | **New** | Barrel export |
| `src/components/Sidebar.jsx` | **Edit** | Collapsible sidebar with CSS variable styling |
| `src/components/Layout.jsx` | **Edit** | New header (search, dark mode, notifications, avatar) |
| `src/components/Toast.jsx` | **Edit** | Update to CSS variable styling |
| `src/pages/Dashboard.jsx` | **Edit** | KPI cards + Kimi-style layout |
| `src/pages/Orders.jsx` | **Edit** | Card-wrapped table + filter buttons + styled modal |
| `src/pages/Products.jsx` | **Edit** | Card-wrapped table + stats + styled modals |
| `src/pages/Customers.jsx` | **Edit** | Card-wrapped table + stats + styled modal |
| `src/utils.js` | **Edit** | Add `cn()` utility (clsx wrapper) |

## Implementation Order

1. CSS variables + base styles (`index.css`)
2. UI components (`src/components/ui/`)
3. Layout + Sidebar + Header
4. Dashboard page
5. Orders page
6. Products page
7. Customers page
8. Dark mode toggle + persistence
9. Visual QA pass
