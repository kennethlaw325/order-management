# Remaining MVP Tasks — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete all remaining web dashboard pages (Products, Inventory, Users, Stores, Settings) and build the full POS Terminal app.

**Architecture:** Monorepo at `C:\Users\Kenneth\Desktop\enterprise-pos`. Web dashboard (`apps/web`) uses Next.js App Router + tRPC hooks. POS terminal (`apps/pos-terminal`) is a separate Next.js app on port 3001 sharing the same tRPC API. All pages follow the existing pattern: `"use client"`, `trpc.*` hooks, Tailwind CSS, session-based storeId.

**Tech Stack:** TypeScript, Next.js 14 (App Router), tRPC v11, Prisma + SQLite, NextAuth.js, Zustand, Tailwind CSS

**Existing API Routers (all built):**
- `trpc.product` — list (search, categoryId, activeOnly), getById, create, update, delete (soft)
- `trpc.order` — list (storeId, dateFrom, dateTo, status), getById, create
- `trpc.inventory` — list (storeId, lowStockOnly, search), adjust (productId, storeId, adjustment, reason)
- `trpc.store` — list, getById, create, update
- `trpc.user` — list, create, update, me
- `trpc.dashboard` — todayStats, recentOrders, lowStockCount
- **No category router exists** — needs to be added

**Existing UI pattern** (from `dashboard/page.tsx`):
```tsx
"use client";
import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";
// session storeId: (session?.user as any)?.storeId
```

---

## Task 1: Add Category Router to API

**Files:**
- Create: `packages/api/src/routers/category.ts`
- Modify: `packages/api/src/index.ts`

**Step 1: Create category router**

```typescript
// packages/api/src/routers/category.ts
import { z } from "zod";
import { router, protectedProcedure, managerProcedure } from "../trpc";

export const categoryRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.category.findMany({
      include: { parent: true, _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
  }),

  create: managerProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      parentId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.category.create({ data: input });
    }),

  update: managerProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      parentId: z.string().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.category.update({ where: { id }, data });
    }),

  delete: managerProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.category.delete({ where: { id: input } });
    }),
});
```

**Step 2: Register in app router**

Add to `packages/api/src/index.ts`:
```typescript
import { categoryRouter } from "./routers/category";
// ...
category: categoryRouter,
```

**Step 3: Commit**

```bash
git add packages/api/src/routers/category.ts packages/api/src/index.ts
git commit -m "feat: add category CRUD router"
```

---

## Task 2: Web App — Product Management

**Files:**
- Create: `apps/web/src/app/(dashboard)/products/page.tsx`
- Create: `apps/web/src/app/(dashboard)/products/[id]/page.tsx`

**Step 1: Product list page**

`/products` — Table with columns: Name, SKU, Price, Category, Status (active/inactive badge).
- Search input (debounced, uses `trpc.product.list({ search })`)
- "Add Product" button → navigates to `/products/new`
- Toggle: "Show inactive" (controls `activeOnly` param)
- Click row → `/products/[id]` edit page

**Step 2: Product create/edit page**

`/products/[id]` (where `id` can be `new`) — Form with:
- Fields: name, SKU, barcode, price, cost, category (dropdown from `trpc.category.list`), isActive toggle
- If `id !== "new"`: load existing with `trpc.product.getById`, pre-fill form
- Submit → `trpc.product.create` or `trpc.product.update`
- Success → redirect to `/products`

**Step 3: Verify**

Create, edit, deactivate a product from the UI.

**Step 4: Commit**

```bash
git add apps/web/src/app/\(dashboard\)/products
git commit -m "feat: add product management pages"
```

---

## Task 3: Web App — Category Management

**Files:**
- Create: `apps/web/src/app/(dashboard)/categories/page.tsx`

**Step 1: Category list page**

`/categories` — Simple inline-editable list:
- Table: Name, Parent Category, Product Count
- "Add Category" row at top (inline name input + optional parent dropdown + save button)
- Edit button per row → inline editing
- Delete button (only if product count is 0)
- Uses `trpc.category.list`, `trpc.category.create`, `trpc.category.update`, `trpc.category.delete`

**Step 2: Add nav link**

Add `{ href: "/categories", label: "Categories", icon: "🏷️" }` to sidebar `navItems` in `apps/web/src/components/sidebar.tsx` (after Products).

**Step 3: Commit**

```bash
git add apps/web/src/app/\(dashboard\)/categories apps/web/src/components/sidebar.tsx
git commit -m "feat: add category management page"
```

---

## Task 4: Web App — Inventory Management

**Files:**
- Create: `apps/web/src/app/(dashboard)/inventory/page.tsx`

**Step 1: Inventory list page**

`/inventory` — Table: Product Name, SKU, Current Stock, Low Stock Threshold, Status (OK=green / Low=red badge).
- Store selector dropdown (from `trpc.store.list`, default to session storeId)
- "Show low stock only" toggle (controls `lowStockOnly` param)
- Search input (controls `search` param)
- Uses `trpc.inventory.list`

**Step 2: Stock adjustment modal**

Click a row → opens a modal/dialog:
- Shows: product name, current quantity
- Input: adjustment amount (positive = add, negative = remove)
- Optional reason text input
- Submit → `trpc.inventory.adjust({ productId, storeId, adjustment, reason })`
- On success: close modal, refetch list

**Step 3: Verify**

Adjust stock for a product, see quantity change.

**Step 4: Commit**

```bash
git add apps/web/src/app/\(dashboard\)/inventory
git commit -m "feat: add inventory management page"
```

---

## Task 5: Web App — User Management

**Files:**
- Create: `apps/web/src/app/(dashboard)/users/page.tsx`

**Step 1: User list page**

`/users` — Table: Name, Email, Role (badge), Store.
- "Add User" button → opens modal
- Admin only (non-admin sees "Access denied" message)
- Uses `trpc.user.list`

**Step 2: Add/Edit user modal**

Modal with form:
- Fields: name, email, password (min 6), role (dropdown: admin/manager/cashier), store (dropdown from `trpc.store.list`)
- Submit → `trpc.user.create` or `trpc.user.update`
- On success: close modal, refetch list

**Step 3: Commit**

```bash
git add apps/web/src/app/\(dashboard\)/users
git commit -m "feat: add user management page"
```

---

## Task 6: Web App — Store Management

**Files:**
- Create: `apps/web/src/app/(dashboard)/stores/page.tsx`

**Step 1: Store list page**

`/stores` — Table: Name, Address, Phone.
- "Add Store" button → opens modal
- Admin only
- Uses `trpc.store.list`

**Step 2: Add/Edit store modal**

Modal with form:
- Fields: name, address, phone
- Submit → `trpc.store.create` or `trpc.store.update`
- On success: close modal, refetch list

**Step 3: Commit**

```bash
git add apps/web/src/app/\(dashboard\)/stores
git commit -m "feat: add store management page"
```

---

## Task 7: Web App — Settings Page

**Files:**
- Create: `apps/web/src/app/(dashboard)/settings/page.tsx`

**Step 1: Settings form**

`/settings` — Simple form:
- Tax rate (%) — number input
- Currency symbol — text input (default "$")
- Saved to `localStorage` key `pos-settings`
- Load on mount, save on submit
- Success toast/message

**Step 2: Commit**

```bash
git add apps/web/src/app/\(dashboard\)/settings
git commit -m "feat: add settings page with localStorage persistence"
```

---

## Task 8: POS Terminal — App Scaffold

**Files:**
- Create: `apps/pos-terminal/` — Full Next.js app

**Step 1: Scaffold Next.js app**

```bash
cd apps
npx create-next-app@latest pos-terminal --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

**Step 2: Add workspace dependencies**

Add to `apps/pos-terminal/package.json`:
- `@enterprise-pos/api`, `@enterprise-pos/db`, `@enterprise-pos/shared`
- `@trpc/client`, `@trpc/react-query`, `@tanstack/react-query`
- `next-auth`
- `zustand`

Set dev script port: `"dev": "next dev -p 3001"`

**Step 3: Set up tRPC client + NextAuth**

Same pattern as `apps/web`:
- `src/lib/trpc.ts` — tRPC React hooks
- `src/lib/trpc-provider.tsx` — QueryClient + tRPC provider
- `src/lib/auth.ts` — shared authOptions
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/trpc/[trpc]/route.ts`
- `src/app/providers.tsx` — SessionProvider + TRPCProvider
- `src/app/layout.tsx` — wrap with Providers

**Step 4: Login page**

Simple login page at `/login` (same as web app pattern).

**Step 5: Verify**

Run `npx turbo dev`, hit `localhost:3001`, login works.

**Step 6: Commit**

```bash
git add apps/pos-terminal
git commit -m "feat: scaffold POS terminal app with auth + tRPC"
```

---

## Task 9: POS Terminal — Cart Store (Zustand)

**Files:**
- Create: `apps/pos-terminal/src/store/cart.ts`

**Step 1: Create Zustand cart store**

```typescript
import { create } from "zustand";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
}

interface CartStore {
  items: CartItem[];
  discount: number;
  addItem: (product: { id: string; name: string; price: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setItemDiscount: (productId: string, discount: number) => void;
  setOrderDiscount: (discount: number) => void;
  clear: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
}
```

- `addItem` — if product exists, increment quantity; otherwise add new item
- `removeItem` — filter out by productId
- `updateQuantity` — if qty ≤ 0, remove item; otherwise update
- `getSubtotal` — sum of (price × quantity - discount) per item
- `getTotal` — subtotal - order discount

**Step 2: Commit**

```bash
git add apps/pos-terminal/src/store
git commit -m "feat: add Zustand cart store for POS terminal"
```

---

## Task 10: POS Terminal — Main UI

**Files:**
- Create: `apps/pos-terminal/src/app/(pos)/layout.tsx` — auth guard
- Create: `apps/pos-terminal/src/app/(pos)/page.tsx` — main POS layout
- Create: `apps/pos-terminal/src/components/product-grid.tsx`
- Create: `apps/pos-terminal/src/components/cart-panel.tsx`
- Create: `apps/pos-terminal/src/components/category-tabs.tsx`
- Create: `apps/pos-terminal/src/components/search-bar.tsx`
- Create: `apps/pos-terminal/src/components/checkout-dialog.tsx`
- Create: `apps/pos-terminal/src/components/receipt-dialog.tsx`

**Step 1: Main POS layout**

Two-column layout (left = products, right = cart). Header: store name, cashier name, clock.

**Step 2: Product grid**

- Fetches products via `trpc.product.list`
- Grid of cards (name + price)
- Click card → `useCartStore.addItem()`
- Filtered by category tabs + search

**Step 3: Category tabs**

Horizontal tab bar: "All" + each category. Clicking tab sets a `categoryId` filter.

**Step 4: Search bar**

Text input, debounced (300ms). Filters product grid by name/SKU/barcode.

**Step 5: Cart panel**

Right side:
- Cart items list (name, qty +/- buttons, line total, remove button)
- Subtotal, discount, tax, total
- "Discount" button → input for order-level discount
- "Clear" button
- Payment buttons: Cash, Card, FPS, Other

**Step 6: Checkout dialog**

When payment button clicked:
1. Confirmation dialog with order summary
2. On confirm → `trpc.order.create({ storeId, items, discount, tax, paymentMethod })`
3. On success → show receipt → clear cart

**Step 7: Receipt dialog**

Shows: order number, items, totals, payment method, timestamp. "New Order" button to dismiss.

**Step 8: Verify full flow**

Login → search/browse products → add to cart → adjust qty → apply discount → checkout → receipt → cart cleared.

**Step 9: Commit**

```bash
git add apps/pos-terminal/src
git commit -m "feat: add POS terminal UI with product grid, cart, and checkout"
```

---

## Task 11: POS Terminal — Keyboard Shortcuts

**Files:**
- Modify: `apps/pos-terminal/src/app/(pos)/page.tsx`

**Step 1: Add keyboard event listener**

```typescript
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === "F1") { e.preventDefault(); /* focus search */ }
    if (e.key === "F2") { e.preventDefault(); /* open discount dialog */ }
    if (e.key === "F3") { e.preventDefault(); /* open checkout */ }
    if (e.key === "Escape") { e.preventDefault(); /* clear cart */ }
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, []);
```

**Step 2: Commit**

```bash
git add apps/pos-terminal/src
git commit -m "feat: add keyboard shortcuts to POS terminal"
```

---

## Task 12: Integration Test — Full Flow

**Step 1: Start both apps**

```bash
npx turbo dev
```

Web on `:3000`, POS on `:3001`.

**Step 2: Test complete flow**

1. Web dashboard (`localhost:3000`) → login as admin
2. Dashboard → verify stats (zeros or seed data)
3. Products → create a new product
4. Categories → create a category, assign product
5. Inventory → verify stock, adjust stock
6. Users → create a cashier user
7. Stores → verify store exists
8. Settings → set tax rate
9. POS terminal (`localhost:3001`) → login as cashier
10. Browse products, add to cart
11. Apply discount, checkout with Cash
12. Receipt shown, cart cleared
13. Back to web dashboard → order appears in Orders page, stats update
14. Inventory → stock decremented

**Step 3: Fix any issues found**

**Step 4: Final commit**

```bash
git commit -m "feat: complete MVP — all web pages + POS terminal"
```

---

## Summary

| Task | Description | Scope |
|------|-------------|-------|
| 1 | Category Router (API) | Backend |
| 2 | Product Management Pages | Web |
| 3 | Category Management Page | Web |
| 4 | Inventory Management Page | Web |
| 5 | User Management Page | Web |
| 6 | Store Management Page | Web |
| 7 | Settings Page | Web |
| 8 | POS Terminal Scaffold | POS |
| 9 | Cart Store (Zustand) | POS |
| 10 | POS Terminal Main UI | POS |
| 11 | Keyboard Shortcuts | POS |
| 12 | Integration Test | E2E |

**Estimated tasks:** 12 tasks, Web dashboard (Tasks 1-7), POS terminal (Tasks 8-11), Integration (Task 12).
