# Enterprise POS+ERP+CRM+BI System Design

**Date:** 2026-02-07
**Status:** Approved
**Author:** Kenneth + Claude

---

## Vision

Multi-industry, scale-ready POS+ERP+CRM+BI integrated platform. Start as internal tool and learning project, with potential to commercialize as SaaS.

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Language | TypeScript (full-stack) | Single language, end-to-end type safety |
| Framework | Next.js | SSR, routing, API routes, mature ecosystem |
| API | tRPC | End-to-end type safety, zero code-gen |
| ORM | Prisma | Type-safe DB access, easy migrations |
| Database | SQLite (→ PostgreSQL later) | Zero config for dev, migrate when needed |
| Auth | NextAuth.js | Simple credential login, extensible |
| State | Zustand | Lightweight, ideal for POS cart state |
| UI | shadcn/ui | Customizable, not bloated |
| Charts | Recharts | Lightweight dashboard charts |
| Forms | React Hook Form + Zod | Type-safe validation |
| Tables | TanStack Table | Sorting, filtering, pagination |
| Monorepo | Turborepo | Build caching, workspace management |

## Project Structure

```
enterprise-pos/
├── apps/
│   ├── web/                  # Next.js main app (Dashboard + all module UI)
│   └── pos-terminal/         # POS cashier interface (fullscreen, touch-friendly)
├── packages/
│   ├── db/                   # Prisma schema + SQLite
│   ├── api/                  # tRPC routers (all business logic)
│   ├── shared/               # Shared types, constants, utils
│   └── ui/                   # Shared UI components
├── turbo.json
└── package.json
```

### Apps

- **web** — Management dashboard for inventory, orders, users, stores, analytics
- **pos-terminal** — Dedicated cashier UI with large buttons, keyboard shortcuts, touch-friendly design

### Packages

- **db** — Single Prisma schema, all modules share one SQLite database
- **api** — tRPC routers split by module (auth, product, order, inventory, store, user, dashboard)
- **shared** — Common types, constants, utility functions
- **ui** — Reusable UI component library shared between both apps

## Database Schema (MVP)

### Core

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      String   // admin | manager | cashier
  storeId   String?
  store     Store?   @relation(fields: [storeId], references: [id])
  orders    Order[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Store {
  id        String      @id @default(cuid())
  name      String
  address   String?
  phone     String?
  users     User[]
  inventory Inventory[]
  orders    Order[]
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}
```

### Products

```prisma
model Category {
  id          String     @id @default(cuid())
  name        String
  description String?
  parentId    String?
  parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  products    Product[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Product {
  id         String      @id @default(cuid())
  name       String
  sku        String?     @unique
  barcode    String?     @unique
  price      Float
  cost       Float?      // Purchase cost (for ERP profit calculation later)
  categoryId String?
  category   Category?   @relation(fields: [categoryId], references: [id])
  isActive   Boolean     @default(true)
  inventory  Inventory[]
  orderItems OrderItem[]
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}
```

### Inventory

```prisma
model Inventory {
  id                String  @id @default(cuid())
  productId         String
  product           Product @relation(fields: [productId], references: [id])
  storeId           String
  store             Store   @relation(fields: [storeId], references: [id])
  quantity          Int     @default(0)
  lowStockThreshold Int     @default(10)

  @@unique([productId, storeId])
}
```

### Orders

```prisma
model Order {
  id            String      @id @default(cuid())
  orderNumber   String      @unique
  storeId       String
  store         Store       @relation(fields: [storeId], references: [id])
  cashierId     String
  cashier       User        @relation(fields: [cashierId], references: [id])
  customerId    String?     // Optional, for CRM later
  subtotal      Float
  discount      Float       @default(0)
  tax           Float       @default(0)
  total         Float
  paymentMethod String      // "Cash" | "Card" | "FPS" | "Other" (record only)
  status        String      @default("completed") // completed | refunded | voided
  items         OrderItem[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  unitPrice Float
  discount  Float   @default(0)
  subtotal  Float
}
```

### Reserved for CRM (Phase 3)

```prisma
model Customer {
  id        String   @id @default(cuid())
  name      String
  phone     String?
  email     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## POS Terminal UI

```
┌──────────────────────────────────────────────────────┐
│  Header: Store | Cashier | DateTime          [Gear]  │
├────────────────────────────┬─────────────────────────┤
│                            │  Cart                    │
│   Product Grid             │  ┌───────────────────┐  │
│                            │  │ Item A  x2   $200 │  │
│  [Search / Barcode input]  │  │ Item B  x1   $150 │  │
│                            │  │                   │  │
│  ┌──────┐ ┌──────┐        │  └───────────────────┘  │
│  │Prod 1│ │Prod 2│ ...    │                         │
│  │ $100 │ │ $200 │        │  Subtotal:       $350   │
│  └──────┘ └──────┘        │  Discount:       -$50   │
│                            │  Tax:            $0     │
│  Category tabs:            │  ────────────────────   │
│  [All] [Food] [Drink] ... │  Total:          $300   │
│                            │                         │
│                            │  [Discount] [Clear]     │
│                            │  [Cash] [Card] [Other]  │
├────────────────────────────┴─────────────────────────┤
│  Shortcuts: F1=Search  F2=Discount  F3=Pay  ESC=Clear│
└──────────────────────────────────────────────────────┘
```

### POS Features (MVP)

1. **Product selection** — Grid display, tap to add to cart, category filter
2. **Search** — By name / SKU / barcode
3. **Cart operations** — Edit quantity, remove item, manual discount
4. **Checkout** — Select payment method → create Order → deduct inventory → show receipt
5. **Keyboard shortcuts** — Essential for cashier speed

## Web Dashboard

### Pages

| Page | MVP Features |
|------|-------------|
| **Dashboard** | Today's revenue, order count, avg order value, simple chart |
| **Products** | CRUD products, manage categories, set prices |
| **Orders** | Order list, view details, date filter |
| **Inventory** | View stock levels, manual adjustment, low-stock alerts |
| **Users** | Manage cashier accounts, role permissions |
| **Stores** | Store information management |
| **Settings** | Tax rate, currency, basic config |

### Role Permissions

| Role | Access |
|------|--------|
| Admin | Everything |
| Manager | Products + Orders + Inventory + Reports |
| Cashier | POS Terminal only |

## API Structure

```
packages/api/src/routers/
├── auth.ts          # Login, logout, session management
├── product.ts       # Product CRUD, search, categories
├── order.ts         # Create order, query, statistics
├── inventory.ts     # Stock query, adjustment, low-stock alerts
├── store.ts         # Store CRUD
├── user.ts          # User management, roles
└── dashboard.ts     # Overview stats, chart aggregation
```

## Not in MVP

- Real payment gateway integration
- Promotion/discount system (Phase 2)
- Refund/return flow (Phase 2)
- Barcode scanner integration (Phase 2)
- Receipt printing (Phase 2)
- WebSocket / real-time sync (Phase 2)
- Automated testing (Phase 2)
- i18n (Phase 2)
- Dark mode (Phase 2)
- Customer/membership system (Phase 3)
- BI analytics dashboards (Phase 3)
- Offline mode (Phase 4)
- Multi-tenant SaaS (Phase 4)
- Cloud deployment (Phase 4)

## Roadmap

### Phase 1 — POS MVP (Current)

- Project init (Turborepo + Prisma + SQLite)
- Database schema
- Auth (login + role-based access)
- Product management (CRUD + categories)
- POS Terminal (cashier UI + cart + checkout)
- Inventory management (view + manual adjust)
- Order records (list + details)
- Dashboard (basic stats)

### Phase 2 — ERP Basics + POS Enhancements

- Promotion/discount system
- Refund/return flow
- Supplier management + purchase orders
- Cost calculation + profit reports
- Barcode scanner integration
- Receipt printing
- Automated testing

### Phase 3 — CRM + BI

- Customer membership system
- Points / membership tiers
- Purchase history + customer analytics
- BI Dashboard (sales trends, product rankings, time-based analysis)
- Report export (CSV / PDF)
- Database migration to PostgreSQL

### Phase 4 — Commercialization

- Multi-tenant SaaS architecture
- Payment gateway integration
- i18n multilingual support
- Cloud deployment (AWS / Vercel)
- Offline mode (Service Worker)
- API rate limiting + security hardening

## Design Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | SQLite over PostgreSQL | Zero config for dev, Prisma makes migration easy later |
| Monorepo | Turborepo | Shared code between apps, single repo management |
| Two apps | web + pos-terminal | Different UI needs: dashboard vs touch-friendly cashier |
| Payment | Record-only | MVP simplicity, real gateway in Phase 4 |
| Discount | Manual input (MVP) | Promotion system deferred to Phase 2 |
| Auth | NextAuth.js credentials | Simple to start, extensible later |
