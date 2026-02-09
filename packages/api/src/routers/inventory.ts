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
