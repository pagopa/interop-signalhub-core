import { z } from "zod";

import { majorMinorRegex } from "../models/index.js";

export const APIServiceConfig = z
  .object({
    API_VERSION: z.string().regex(majorMinorRegex)
  })
  .transform((c) => ({
    apiVersion: c.API_VERSION
  }));
export type APIServiceConfig = z.infer<typeof APIServiceConfig>;
