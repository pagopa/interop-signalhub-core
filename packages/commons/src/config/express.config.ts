import { z } from "zod";
export const AppContext = z.object({
  serviceName: z.string(),
  correlationId: z.string(),
});

export const Headers = z.object({
  authorization: z.string().nullish(),
  //   "x-correlation-id": z.string().nullish(),
});

export type Headers = z.infer<typeof Headers>;

export type AppContext = z.infer<typeof AppContext>;

declare module "express" {
  interface Request {
    ctx?: AppContext;
  }
}
