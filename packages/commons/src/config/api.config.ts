import { z } from "zod";

export const APIServiceConfig = z
  .object({
    API_PULL_VERSION: z.string().default("v1"),
    API_PUSH_VERSION: z.string().default("v1"),
  })
  .transform((c) => ({
    apiPullVersion: c.API_PULL_VERSION,
    apiPushVersion: c.API_PUSH_VERSION,
  }));
export type APIServiceConfig = z.infer<typeof APIServiceConfig>;
