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
