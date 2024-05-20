import { z } from "zod";
export const AppContext = z.object({
  serviceName: z.string(),
  correlationId: z.string(),
});
export type AppContext = z.infer<typeof AppContext>;

declare module "express" {
  interface Request {
    ctx?: AppContext;
  }
}
