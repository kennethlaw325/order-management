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
