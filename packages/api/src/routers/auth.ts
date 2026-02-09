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
