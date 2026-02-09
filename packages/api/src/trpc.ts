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
