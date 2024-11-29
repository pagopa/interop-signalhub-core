import { z } from "zod";

const majorMinorRegex = /^([1-9]\d*|0)\.([1-9]\d*|0)$/;

export const APIServiceConfig = z
  .object({
    API_VERSION: z.string().regex(majorMinorRegex)
  })
  .transform((c) => ({
    apiVersion: c.API_VERSION
  }));
export type APIServiceConfig = z.infer<typeof APIServiceConfig>;
