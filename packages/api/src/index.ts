import { router } from "./trpc";
import { authRouter } from "./routers/auth";
import { productRouter } from "./routers/product";
import { orderRouter } from "./routers/order";
import { inventoryRouter } from "./routers/inventory";
import { storeRouter } from "./routers/store";
import { userRouter } from "./routers/user";
import { dashboardRouter } from "./routers/dashboard";
import { categoryRouter } from "./routers/category";

export const appRouter = router({
  auth: authRouter,
  product: productRouter,
  order: orderRouter,
  inventory: inventoryRouter,
  store: storeRouter,
  user: userRouter,
  dashboard: dashboardRouter,
  category: categoryRouter,
});

export type AppRouter = typeof appRouter;

export { createContext } from "./trpc";
