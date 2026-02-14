# POS MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a working POS system with product management, cashier terminal, inventory tracking, order records, and a basic dashboard.

**Architecture:** TypeScript monorepo using Turborepo. Two Next.js apps (web dashboard + POS terminal) sharing packages for database (Prisma + SQLite), tRPC API, UI components, and shared types.

**Tech Stack:** TypeScript, Next.js, tRPC, Prisma, SQLite, NextAuth.js, Zustand, shadcn/ui, Recharts, React Hook Form + Zod, TanStack Table, Turborepo

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json` (root workspace)
- Create: `turbo.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `packages/db/package.json`
- Create: `packages/api/package.json`
- Create: `packages/shared/package.json`
- Create: `packages/ui/package.json`
- Create: `apps/web/package.json` (Next.js app)
- Create: `apps/pos-terminal/package.json` (Next.js app)

**Step 1: Initialize git repo**

```bash
cd C:/Users/Kenneth/Desktop/enterprise-pos
git init
```

**Step 2: Create root package.json**

```json
{
  "name": "enterprise-pos",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "db:push": "cd packages/db && npx prisma db push",
    "db:studio": "cd packages/db && npx prisma studio",
    "db:seed": "cd packages/db && npx tsx src/seed.ts"
  },
  "devDependencies": {
    "turbo": "^2",
    "typescript": "^5"
  },
  "packageManager": "npm@10.0.0"
}
```

**Step 3: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    }
  }
}
```

**Step 4: Create .gitignore**

```
node_modules/
.next/
dist/
*.db
*.db-journal
.env
.env.local
.turbo/
```

**Step 5: Create root tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx"
  }
}
```

**Step 6: Install root dependencies**

```bash
npm install
```

**Step 7: Commit**

```bash
git add -A
git commit -m "chore: initialize monorepo with Turborepo"
```

---

## Task 2: Database Package (packages/db)

**Files:**
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/prisma/schema.prisma`
- Create: `packages/db/src/index.ts`
- Create: `packages/db/src/seed.ts`

**Step 1: Create packages/db/package.json**

```json
{
  "name": "@enterprise-pos/db",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:seed": "tsx src/seed.ts",
    "db:generate": "prisma generate"
  },
  "dependencies": {
    "@prisma/client": "^6"
  },
  "devDependencies": {
    "prisma": "^6",
    "tsx": "^4",
    "typescript": "^5"
  }
}
```

**Step 2: Create packages/db/tsconfig.json**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

**Step 3: Create packages/db/prisma/schema.prisma**

Full schema from design doc — User, Store, Category, Product, Inventory, Order, OrderItem, Customer:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      String   @default("cashier") // admin | manager | cashier
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
  cost       Float?
  categoryId String?
  category   Category?   @relation(fields: [categoryId], references: [id])
  isActive   Boolean     @default(true)
  inventory  Inventory[]
  orderItems OrderItem[]
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}

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

model Order {
  id            String      @id @default(cuid())
  orderNumber   String      @unique
  storeId       String
  store         Store       @relation(fields: [storeId], references: [id])
  cashierId     String
  cashier       User        @relation(fields: [cashierId], references: [id])
  customerId    String?
  subtotal      Float
  discount      Float       @default(0)
  tax           Float       @default(0)
  total         Float
  paymentMethod String
  status        String      @default("completed")
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

model Customer {
  id        String   @id @default(cuid())
  name      String
  phone     String?
  email     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Step 4: Create packages/db/src/index.ts**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "@prisma/client";
```

**Step 5: Create packages/db/src/seed.ts**

Seed script that creates a default store, admin user, sample categories, and sample products:

```typescript
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default store
  const store = await prisma.store.create({
    data: {
      name: "Main Store",
      address: "123 Main Street",
      phone: "12345678",
    },
  });

  // Create admin user (password: admin123)
  const hashedPassword = await hash("admin123", 12);
  await prisma.user.create({
    data: {
      email: "admin@pos.local",
      name: "Admin",
      password: hashedPassword,
      role: "admin",
      storeId: store.id,
    },
  });

  // Create categories
  const food = await prisma.category.create({
    data: { name: "Food" },
  });
  const drinks = await prisma.category.create({
    data: { name: "Drinks" },
  });

  // Create sample products with inventory
  const products = [
    { name: "Hamburger", price: 45, cost: 20, sku: "FOOD-001", categoryId: food.id },
    { name: "Fries", price: 25, cost: 8, sku: "FOOD-002", categoryId: food.id },
    { name: "Chicken Wings", price: 55, cost: 25, sku: "FOOD-003", categoryId: food.id },
    { name: "Cola", price: 15, cost: 5, sku: "DRK-001", categoryId: drinks.id },
    { name: "Lemon Tea", price: 18, cost: 6, sku: "DRK-002", categoryId: drinks.id },
    { name: "Water", price: 10, cost: 3, sku: "DRK-003", categoryId: drinks.id },
  ];

  for (const p of products) {
    const product = await prisma.product.create({ data: p });
    await prisma.inventory.create({
      data: {
        productId: product.id,
        storeId: store.id,
        quantity: 100,
        lowStockThreshold: 10,
      },
    });
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Step 6: Install dependencies and push schema**

```bash
cd packages/db
npm install
npx prisma generate
npx prisma db push
```

**Step 7: Run seed**

```bash
npm install bcryptjs && npm install -D @types/bcryptjs
npx tsx src/seed.ts
```

**Step 8: Verify with Prisma Studio**

```bash
npx prisma studio
```

Open browser, check all tables have data. Close studio.

**Step 9: Commit**

```bash
cd ../..
git add packages/db
git commit -m "feat: add database package with Prisma schema and seed data"
```

---

## Task 3: Shared Package (packages/shared)

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/constants.ts`
- Create: `packages/shared/src/types.ts`

**Step 1: Create packages/shared/package.json**

```json
{
  "name": "@enterprise-pos/shared",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "devDependencies": {
    "typescript": "^5"
  }
}
```

**Step 2: Create packages/shared/tsconfig.json**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

**Step 3: Create packages/shared/src/constants.ts**

```typescript
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  CASHIER: "cashier",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PAYMENT_METHODS = {
  CASH: "Cash",
  CARD: "Card",
  FPS: "FPS",
  OTHER: "Other",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const ORDER_STATUS = {
  COMPLETED: "completed",
  REFUNDED: "refunded",
  VOIDED: "voided",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
```

**Step 4: Create packages/shared/src/types.ts**

```typescript
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
}

export interface CartState {
  items: CartItem[];
  discount: number; // order-level discount
}
```

**Step 5: Create packages/shared/src/index.ts**

```typescript
export * from "./constants";
export * from "./types";
```

**Step 6: Commit**

```bash
git add packages/shared
git commit -m "feat: add shared package with constants and types"
```

---

## Task 4: API Package (packages/api)

**Files:**
- Create: `packages/api/package.json`
- Create: `packages/api/tsconfig.json`
- Create: `packages/api/src/index.ts`
- Create: `packages/api/src/trpc.ts`
- Create: `packages/api/src/routers/auth.ts`
- Create: `packages/api/src/routers/product.ts`
- Create: `packages/api/src/routers/order.ts`
- Create: `packages/api/src/routers/inventory.ts`
- Create: `packages/api/src/routers/store.ts`
- Create: `packages/api/src/routers/user.ts`
- Create: `packages/api/src/routers/dashboard.ts`

**Step 1: Create packages/api/package.json**

```json
{
  "name": "@enterprise-pos/api",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "@enterprise-pos/db": "*",
    "@enterprise-pos/shared": "*",
    "@trpc/server": "^11",
    "zod": "^3",
    "bcryptjs": "^2"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2",
    "typescript": "^5"
  }
}
```

**Step 2: Create packages/api/tsconfig.json**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

**Step 3: Create packages/api/src/trpc.ts**

tRPC initialization with context that includes prisma and session user:

```typescript
import { initTRPC, TRPCError } from "@trpc/server";
import { prisma } from "@enterprise-pos/db";
import type { User } from "@enterprise-pos/db";

export type Context = {
  prisma: typeof prisma;
  user: User | null;
};

export const createContext = (user: User | null): Context => ({
  prisma,
  user,
});

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

export const managerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});
```

**Step 4: Create packages/api/src/routers/product.ts**

```typescript
import { z } from "zod";
import { router, protectedProcedure, managerProcedure } from "../trpc";

export const productRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        categoryId: z.string().optional(),
        search: z.string().optional(),
        activeOnly: z.boolean().default(true),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};
      if (input?.activeOnly !== false) where.isActive = true;
      if (input?.categoryId) where.categoryId = input.categoryId;
      if (input?.search) {
        where.OR = [
          { name: { contains: input.search } },
          { sku: { contains: input.search } },
          { barcode: { contains: input.search } },
        ];
      }
      return ctx.prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { name: "asc" },
      });
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.product.findUniqueOrThrow({
        where: { id: input },
        include: { category: true, inventory: true },
      });
    }),

  create: managerProcedure
    .input(
      z.object({
        name: z.string().min(1),
        sku: z.string().optional(),
        barcode: z.string().optional(),
        price: z.number().positive(),
        cost: z.number().positive().optional(),
        categoryId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.product.create({ data: input });
    }),

  update: managerProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        sku: z.string().optional(),
        barcode: z.string().optional(),
        price: z.number().positive().optional(),
        cost: z.number().positive().optional(),
        categoryId: z.string().nullable().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.product.update({ where: { id }, data });
    }),

  delete: managerProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.product.update({
        where: { id: input },
        data: { isActive: false },
      });
    }),
});
```

**Step 5: Create packages/api/src/routers/order.ts**

```typescript
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const orderRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        storeId: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        status: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};
      if (input?.storeId) where.storeId = input.storeId;
      if (input?.status) where.status = input.status;
      if (input?.dateFrom || input?.dateTo) {
        where.createdAt = {};
        if (input?.dateFrom) where.createdAt.gte = input.dateFrom;
        if (input?.dateTo) where.createdAt.lte = input.dateTo;
      }
      return ctx.prisma.order.findMany({
        where,
        include: { items: { include: { product: true } }, cashier: true },
        orderBy: { createdAt: "desc" },
        take: input?.limit ?? 50,
      });
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.order.findUniqueOrThrow({
        where: { id: input },
        include: {
          items: { include: { product: true } },
          cashier: true,
          store: true,
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().int().positive(),
            unitPrice: z.number().positive(),
            discount: z.number().default(0),
          })
        ).min(1),
        discount: z.number().default(0),
        tax: z.number().default(0),
        paymentMethod: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { items, ...orderData } = input;

      // Calculate totals
      const itemsWithSubtotal = items.map((item) => ({
        ...item,
        subtotal: item.unitPrice * item.quantity - item.discount,
      }));
      const subtotal = itemsWithSubtotal.reduce((sum, i) => sum + i.subtotal, 0);
      const total = subtotal - orderData.discount + orderData.tax;

      // Generate order number: ORD-YYYYMMDD-XXXX
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const count = await ctx.prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });
      const orderNumber = `ORD-${today}-${String(count + 1).padStart(4, "0")}`;

      // Create order + items + deduct inventory in transaction
      return ctx.prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            orderNumber,
            storeId: orderData.storeId,
            cashierId: ctx.user!.id,
            subtotal,
            discount: orderData.discount,
            tax: orderData.tax,
            total,
            paymentMethod: orderData.paymentMethod,
            items: {
              create: itemsWithSubtotal,
            },
          },
          include: { items: { include: { product: true } } },
        });

        // Deduct inventory
        for (const item of items) {
          await tx.inventory.updateMany({
            where: {
              productId: item.productId,
              storeId: orderData.storeId,
            },
            data: {
              quantity: { decrement: item.quantity },
            },
          });
        }

        return order;
      });
    }),
});
```

**Step 6: Create packages/api/src/routers/inventory.ts**

```typescript
import { z } from "zod";
import { router, protectedProcedure, managerProcedure } from "../trpc";

export const inventoryRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        lowStockOnly: z.boolean().default(false),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = { storeId: input.storeId };
      if (input.lowStockOnly) {
        where.quantity = { lte: { ref: "lowStockThreshold" } };
      }
      // Use raw query for low stock filter since Prisma doesn't support column comparison
      if (input.lowStockOnly) {
        return ctx.prisma.$queryRaw`
          SELECT i.*, p.name as productName, p.sku, p.price
          FROM Inventory i
          JOIN Product p ON i.productId = p.id
          WHERE i.storeId = ${input.storeId}
          AND i.quantity <= i.lowStockThreshold
          ORDER BY i.quantity ASC
        `;
      }
      return ctx.prisma.inventory.findMany({
        where: { storeId: input.storeId },
        include: { product: true },
        orderBy: { product: { name: "asc" } },
      });
    }),

  adjust: managerProcedure
    .input(
      z.object({
        productId: z.string(),
        storeId: z.string(),
        adjustment: z.number().int(), // positive = add, negative = remove
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.inventory.update({
        where: {
          productId_storeId: {
            productId: input.productId,
            storeId: input.storeId,
          },
        },
        data: {
          quantity: { increment: input.adjustment },
        },
      });
    }),
});
```

**Step 7: Create packages/api/src/routers/store.ts**

```typescript
import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";

export const storeRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.store.findMany({ orderBy: { name: "asc" } });
  }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.store.findUniqueOrThrow({ where: { id: input } });
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        address: z.string().optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.store.create({ data: input });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.store.update({ where: { id }, data });
    }),
});
```

**Step 8: Create packages/api/src/routers/user.ts**

```typescript
import { z } from "zod";
import { hash } from "bcryptjs";
import { router, adminProcedure, protectedProcedure } from "../trpc";

export const userRouter = router({
  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        storeId: true,
        store: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });
  }),

  create: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1),
        password: z.string().min(6),
        role: z.enum(["admin", "manager", "cashier"]),
        storeId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await hash(input.password, 12);
      return ctx.prisma.user.create({
        data: { ...input, password: hashedPassword },
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        email: z.string().email().optional(),
        name: z.string().min(1).optional(),
        password: z.string().min(6).optional(),
        role: z.enum(["admin", "manager", "cashier"]).optional(),
        storeId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, password, ...data } = input;
      const updateData: any = { ...data };
      if (password) {
        updateData.password = await hash(password, 12);
      }
      return ctx.prisma.user.update({ where: { id }, data: updateData });
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUniqueOrThrow({
      where: { id: ctx.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        store: true,
      },
    });
  }),
});
```

**Step 9: Create packages/api/src/routers/dashboard.ts**

```typescript
import { z } from "zod";
import { router, managerProcedure } from "../trpc";

export const dashboardRouter = router({
  todayStats: managerProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const orders = await ctx.prisma.order.findMany({
        where: {
          storeId: input.storeId,
          status: "completed",
          createdAt: { gte: todayStart },
        },
      });

      const revenue = orders.reduce((sum, o) => sum + o.total, 0);
      const orderCount = orders.length;
      const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;

      return { revenue, orderCount, avgOrderValue };
    }),

  recentOrders: managerProcedure
    .input(z.object({ storeId: z.string(), limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.order.findMany({
        where: { storeId: input.storeId },
        include: { cashier: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  lowStockCount: managerProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(*) as count FROM Inventory
        WHERE storeId = ${input.storeId}
        AND quantity <= lowStockThreshold
      `;
      return result[0]?.count ?? 0;
    }),
});
```

**Step 10: Create packages/api/src/routers/auth.ts**

```typescript
import { z } from "zod";
import { compare } from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../trpc";

export const authRouter = router({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }
      const valid = await compare(input.password, user.password);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }),
});
```

**Step 11: Create packages/api/src/index.ts (root router)**

```typescript
import { router } from "./trpc";
import { authRouter } from "./routers/auth";
import { productRouter } from "./routers/product";
import { orderRouter } from "./routers/order";
import { inventoryRouter } from "./routers/inventory";
import { storeRouter } from "./routers/store";
import { userRouter } from "./routers/user";
import { dashboardRouter } from "./routers/dashboard";

export const appRouter = router({
  auth: authRouter,
  product: productRouter,
  order: orderRouter,
  inventory: inventoryRouter,
  store: storeRouter,
  user: userRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;

export { createContext } from "./trpc";
```

**Step 12: Install dependencies**

```bash
cd packages/api && npm install
```

**Step 13: Commit**

```bash
cd ../..
git add packages/api
git commit -m "feat: add API package with all tRPC routers"
```

---

## Task 5: UI Package (packages/ui)

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/src/index.ts`
- Create: `packages/ui/src/components/button.tsx`
- Create: `packages/ui/tailwind.config.ts`
- Create: `packages/ui/postcss.config.js`
- Create: `packages/ui/src/globals.css`

**Step 1: Create packages/ui/package.json**

```json
{
  "name": "@enterprise-pos/ui",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "class-variance-authority": "^0.7",
    "clsx": "^2",
    "tailwind-merge": "^2",
    "lucide-react": "^0.400"
  },
  "devDependencies": {
    "react": "^19",
    "react-dom": "^19",
    "typescript": "^5",
    "tailwindcss": "^3",
    "autoprefixer": "^10",
    "postcss": "^8"
  },
  "peerDependencies": {
    "react": "^19",
    "react-dom": "^19"
  }
}
```

**Step 2: Create packages/ui/src/index.ts**

This will re-export all shadcn/ui components as they are added. Start with a utility:

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

> **Note:** shadcn/ui components will be added directly into this package as needed during the web and POS terminal app setup. Use `npx shadcn@latest add button dialog input table` etc. pointed at this package's components directory.

**Step 3: Commit**

```bash
git add packages/ui
git commit -m "feat: add UI package with shadcn/ui foundation"
```

---

## Task 6: Web App Setup (apps/web)

**Files:**
- Create: `apps/web/` — Full Next.js app with App Router

**Step 1: Scaffold Next.js app**

```bash
cd apps
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

**Step 2: Add workspace dependencies to apps/web/package.json**

Add these to the `dependencies` section:

```json
{
  "@enterprise-pos/api": "*",
  "@enterprise-pos/db": "*",
  "@enterprise-pos/shared": "*",
  "@enterprise-pos/ui": "*",
  "@trpc/client": "^11",
  "@trpc/server": "^11",
  "@trpc/react-query": "^11",
  "@tanstack/react-query": "^5",
  "next-auth": "^4",
  "recharts": "^2",
  "@tanstack/react-table": "^8",
  "react-hook-form": "^7",
  "@hookform/resolvers": "^3",
  "zod": "^3",
  "zustand": "^5"
}
```

**Step 3: Set up tRPC client**

Create `apps/web/src/lib/trpc.ts`:

```typescript
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@enterprise-pos/api";

export const trpc = createTRPCReact<AppRouter>();
```

Create `apps/web/src/lib/trpc-provider.tsx`:

```typescript
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "./trpc";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: "/api/trpc" })],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

**Step 4: Set up NextAuth**

Create `apps/web/src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@enterprise-pos/db";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;
        const valid = await compare(credentials.password, user.password);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          storeId: user.storeId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.storeId = (user as any).storeId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).storeId = token.storeId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET ?? "dev-secret-change-in-production",
});

export { handler as GET, handler as POST };
```

**Step 5: Set up tRPC API route**

Create `apps/web/src/app/api/trpc/[trpc]/route.ts`:

```typescript
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createContext } from "@enterprise-pos/api";
import { getServerSession } from "next-auth";
import { prisma } from "@enterprise-pos/db";

const handler = async (req: Request) => {
  const session = await getServerSession();
  let user = null;
  if (session?.user?.email) {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
  }

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(user),
  });
};

export { handler as GET, handler as POST };
```

**Step 6: Install dependencies**

```bash
cd apps/web && npm install
```

**Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected: Next.js dev server running on localhost:3000

**Step 8: Commit**

```bash
cd ../..
git add apps/web
git commit -m "feat: add web app with Next.js, tRPC, and NextAuth setup"
```

---

## Task 7: Web App — Login Page

**Files:**
- Create: `apps/web/src/app/login/page.tsx`
- Modify: `apps/web/src/app/layout.tsx` (add providers)

**Step 1: Update root layout with providers**

Wrap app in `TRPCProvider` and NextAuth `SessionProvider`.

**Step 2: Create login page**

Simple form with email + password fields. Uses `signIn("credentials")` from NextAuth. Redirects to `/` on success.

**Step 3: Create dashboard redirect**

`apps/web/src/app/page.tsx` — Check session, redirect to `/login` if not authenticated, show dashboard if authenticated.

**Step 4: Verify login flow**

Start dev server, go to `/login`, enter `admin@pos.local` / `admin123`. Should redirect to dashboard.

**Step 5: Commit**

```bash
git add apps/web/src
git commit -m "feat: add login page and auth flow"
```

---

## Task 8: Web App — Dashboard Page

**Files:**
- Create: `apps/web/src/app/(dashboard)/layout.tsx` (sidebar layout)
- Create: `apps/web/src/app/(dashboard)/page.tsx` (dashboard stats)
- Create: `apps/web/src/components/sidebar.tsx`

**Step 1: Create sidebar layout**

Route group `(dashboard)` with sidebar navigation (Dashboard, Products, Orders, Inventory, Users, Stores, Settings). Sidebar shows current user name + role.

**Step 2: Create dashboard page**

Three stat cards (today's revenue, order count, avg order value) using `trpc.dashboard.todayStats`. Recent orders table using `trpc.dashboard.recentOrders`. Low stock alert badge.

**Step 3: Verify dashboard renders**

Login → should see dashboard with stats (all zeros since no orders yet, seed data products visible).

**Step 4: Commit**

```bash
git add apps/web/src
git commit -m "feat: add dashboard page with stats and sidebar layout"
```

---

## Task 9: Web App — Product Management

**Files:**
- Create: `apps/web/src/app/(dashboard)/products/page.tsx`
- Create: `apps/web/src/app/(dashboard)/products/new/page.tsx`
- Create: `apps/web/src/app/(dashboard)/products/[id]/edit/page.tsx`
- Create: `apps/web/src/app/(dashboard)/categories/page.tsx`

**Step 1: Product list page**

Table with columns: Name, SKU, Price, Category, Status. Search input. "Add Product" button. Click row → edit page.

**Step 2: Create/Edit product form**

Form with fields: name, SKU, barcode, price, cost, category (dropdown), isActive toggle. Uses React Hook Form + Zod validation. Calls `trpc.product.create` or `trpc.product.update`.

**Step 3: Category management page**

Simple list with add/edit inline. Category name + optional parent category dropdown.

**Step 4: Verify CRUD**

Create a product, edit it, deactivate it. Check Prisma Studio to confirm data.

**Step 5: Commit**

```bash
git add apps/web/src
git commit -m "feat: add product and category management pages"
```

---

## Task 10: Web App — Inventory Management

**Files:**
- Create: `apps/web/src/app/(dashboard)/inventory/page.tsx`

**Step 1: Inventory list page**

Table: Product Name, SKU, Current Stock, Low Stock Threshold, Status (OK / Low). Filter: "Show low stock only" toggle. Store selector dropdown.

**Step 2: Stock adjustment**

Click a row → modal with current quantity, adjustment input (+/-), optional reason. Calls `trpc.inventory.adjust`.

**Step 3: Verify adjustment**

Adjust stock for a product, verify quantity changes.

**Step 4: Commit**

```bash
git add apps/web/src
git commit -m "feat: add inventory management page"
```

---

## Task 11: Web App — Order History

**Files:**
- Create: `apps/web/src/app/(dashboard)/orders/page.tsx`
- Create: `apps/web/src/app/(dashboard)/orders/[id]/page.tsx`

**Step 1: Order list page**

Table: Order #, Date, Cashier, Total, Payment Method, Status. Date range filter. Click row → detail page.

**Step 2: Order detail page**

Shows order info + line items table (product, qty, unit price, discount, subtotal). Order totals summary.

**Step 3: Commit**

```bash
git add apps/web/src
git commit -m "feat: add order history and detail pages"
```

---

## Task 12: Web App — User & Store Management

**Files:**
- Create: `apps/web/src/app/(dashboard)/users/page.tsx`
- Create: `apps/web/src/app/(dashboard)/stores/page.tsx`
- Create: `apps/web/src/app/(dashboard)/settings/page.tsx`

**Step 1: User management page**

Table: Name, Email, Role, Store. "Add User" button → modal with form (name, email, password, role, store dropdown). Admin only.

**Step 2: Store management page**

Table: Name, Address, Phone. Add/Edit store. Admin only.

**Step 3: Settings page**

Simple form: Tax rate (%), Currency symbol. Saved to localStorage for MVP (no settings table needed yet).

**Step 4: Commit**

```bash
git add apps/web/src
git commit -m "feat: add user, store, and settings management pages"
```

---

## Task 13: POS Terminal App Setup (apps/pos-terminal)

**Files:**
- Create: `apps/pos-terminal/` — Full Next.js app

**Step 1: Scaffold Next.js app**

```bash
cd apps
npx create-next-app@latest pos-terminal --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

**Step 2: Add workspace dependencies**

Same tRPC/NextAuth setup as web app but with port 3001:

```json
{
  "scripts": {
    "dev": "next dev -p 3001"
  }
}
```

**Step 3: Set up tRPC client + NextAuth (same pattern as web app)**

**Step 4: Commit**

```bash
cd ../..
git add apps/pos-terminal
git commit -m "feat: scaffold POS terminal app"
```

---

## Task 14: POS Terminal — Cart Store (Zustand)

**Files:**
- Create: `apps/pos-terminal/src/store/cart.ts`

**Step 1: Create cart store**

```typescript
import { create } from "zustand";
import type { CartItem } from "@enterprise-pos/shared";

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

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  discount: 0,

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            discount: 0,
          },
        ],
      };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    })),

  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((i) => i.productId !== productId)
          : state.items.map((i) =>
              i.productId === productId ? { ...i, quantity } : i
            ),
    })),

  setItemDiscount: (productId, discount) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, discount } : i
      ),
    })),

  setOrderDiscount: (discount) => set({ discount }),

  clear: () => set({ items: [], discount: 0 }),

  getSubtotal: () =>
    get().items.reduce(
      (sum, i) => sum + i.price * i.quantity - i.discount,
      0
    ),

  getTotal: () => get().getSubtotal() - get().discount,
}));
```

**Step 2: Commit**

```bash
git add apps/pos-terminal/src/store
git commit -m "feat: add Zustand cart store for POS terminal"
```

---

## Task 15: POS Terminal — Main UI

**Files:**
- Create: `apps/pos-terminal/src/app/page.tsx` (main POS layout)
- Create: `apps/pos-terminal/src/components/product-grid.tsx`
- Create: `apps/pos-terminal/src/components/cart-panel.tsx`
- Create: `apps/pos-terminal/src/components/category-tabs.tsx`
- Create: `apps/pos-terminal/src/components/search-bar.tsx`
- Create: `apps/pos-terminal/src/components/checkout-dialog.tsx`
- Create: `apps/pos-terminal/src/components/receipt-dialog.tsx`

**Step 1: Create main POS layout page**

Two-column layout per design: left = product grid with search + category tabs, right = cart panel. Header with store name, cashier name, clock.

**Step 2: Create product grid component**

Fetches products via `trpc.product.list`. Displays as grid of cards (name + price). Click card → `useCartStore.addItem()`. Responsive grid: 3-4 columns.

**Step 3: Create category tabs component**

Horizontal tab bar: "All" + each category from `trpc.product.list`. Clicking tab filters product grid.

**Step 4: Create search bar component**

Text input at top of product area. Debounced search → filters product grid by name/SKU/barcode.

**Step 5: Create cart panel component**

Right side panel showing:
- List of cart items (name, qty +/- buttons, line total, remove button)
- Subtotal, discount, tax, total
- "Discount" button → opens input for order-level discount
- "Clear" button → clears cart
- Payment method buttons: Cash, Card, FPS, Other

**Step 6: Create checkout dialog**

When payment button clicked:
1. Show confirmation dialog with order summary
2. On confirm → call `trpc.order.create`
3. On success → show receipt dialog → clear cart

**Step 7: Create receipt dialog**

Shows: order number, items, totals, payment method, timestamp. "New Order" button to dismiss.

**Step 8: Verify full POS flow**

Login → select products → adjust cart → checkout with Cash → receipt shown → cart cleared → verify order in web dashboard.

**Step 9: Commit**

```bash
git add apps/pos-terminal/src
git commit -m "feat: add POS terminal UI with product grid, cart, and checkout"
```

---

## Task 16: POS Terminal — Keyboard Shortcuts

**Files:**
- Modify: `apps/pos-terminal/src/app/page.tsx`

**Step 1: Add keyboard event listener**

```typescript
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === "F1") { e.preventDefault(); focusSearch(); }
    if (e.key === "F2") { e.preventDefault(); openDiscountDialog(); }
    if (e.key === "F3") { e.preventDefault(); openCheckout(); }
    if (e.key === "Escape") { e.preventDefault(); clearCart(); }
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, []);
```

**Step 2: Verify shortcuts work**

F1 → focuses search, F2 → discount input, F3 → checkout, ESC → clear cart.

**Step 3: Commit**

```bash
git add apps/pos-terminal/src
git commit -m "feat: add keyboard shortcuts to POS terminal"
```

---

## Task 17: Integration Test — Full Flow

**Step 1: Start both apps**

```bash
# Terminal 1: from root
npx turbo dev
```

Both apps should start (web on :3000, pos-terminal on :3001).

**Step 2: Test complete flow**

1. Open web dashboard at `localhost:3000` → login as admin
2. Verify dashboard shows stats (zeros)
3. Go to Products → verify seed data products exist
4. Create a new product
5. Go to Inventory → verify stock levels
6. Open POS terminal at `localhost:3001` → login as admin
7. Select products, add to cart
8. Apply discount
9. Checkout with Cash
10. Back to web dashboard → verify order appears, stats update
11. Check inventory decremented

**Step 3: Fix any issues found**

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete POS MVP with all core features"
```

---

## Summary

| Task | Description | Key Output |
|------|-------------|-----------|
| 1 | Project scaffolding | Monorepo structure + Turborepo |
| 2 | Database package | Prisma schema + SQLite + seed data |
| 3 | Shared package | Constants, types, utilities |
| 4 | API package | All tRPC routers (auth, product, order, inventory, store, user, dashboard) |
| 5 | UI package | shadcn/ui foundation + cn utility |
| 6 | Web app setup | Next.js + tRPC + NextAuth wiring |
| 7 | Login page | Auth flow working |
| 8 | Dashboard | Stats cards + recent orders + sidebar |
| 9 | Product management | CRUD products + categories |
| 10 | Inventory management | Stock view + adjustment |
| 11 | Order history | Order list + detail view |
| 12 | User & store management | Admin pages |
| 13 | POS terminal setup | Second Next.js app scaffolded |
| 14 | Cart store | Zustand state management |
| 15 | POS terminal UI | Full cashier interface |
| 16 | Keyboard shortcuts | F1/F2/F3/ESC shortcuts |
| 17 | Integration test | End-to-end flow verified |
