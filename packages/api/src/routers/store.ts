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
