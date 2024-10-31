import { z } from "zod";

export const HTTPServerConfig = z
  .object({
    HOST: z.string(),
    PORT: z.coerce.number().min(1001)
  })
  .transform((c) => ({
    host: c.HOST,
    port: c.PORT
  }));
export type HTTPServerConfig = z.infer<typeof HTTPServerConfig>;
