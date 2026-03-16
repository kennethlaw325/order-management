import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@enterprise-pos/api";

export const trpc = createTRPCReact<AppRouter>();
