import { z } from "zod";
import { router, protectedProcedure, managerProcedure } from "../trpc";

export const categoryRouter = router({
  list: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.category.findMany({
        include: {
          parent: true,
          _count: { select: { products: true } },
        },
        orderBy: { name: "asc" },
      });
    }),

  create: managerProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.category.create({ data: input });
    }),

  update: managerProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        parentId: z.string().nullable().optional(),
      })
    )
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
