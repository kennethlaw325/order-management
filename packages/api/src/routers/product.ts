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
