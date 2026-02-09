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
