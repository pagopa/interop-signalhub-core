import { z } from "zod";

export const SignalHubStoreConfig = z
  .object({
    SH_DB_HOST: z.string(),
    SH_DB_NAME: z.string(),
    SH_DB_USERNAME: z.string(),
    SH_DB_PASSWORD: z.string(),
    SH_DB_PORT: z.coerce.number().min(1001),
    SH_DB_SCHEMA: z.string(),
    SH_DB_USE_SSL: z
      .enum(["true", "false"])
      .transform((value) => value === "true"),
  })
  .transform((c) => ({
    signalhubStoreDbHost: c.SH_DB_HOST,
    signalhubStoreDbName: c.SH_DB_NAME,
    signalhubStoreDbUsername: c.SH_DB_USERNAME,
    signalhubStoreDbPassword: encodeURIComponent(c.SH_DB_PASSWORD),
    signalhubStoreDbPort: c.SH_DB_PORT,
    signalhubStoreDbSchema: c.SH_DB_SCHEMA,
    signalhubStoreDbUseSSL: c.SH_DB_USE_SSL,
  }));

export type SignalHubStoreConfig = z.infer<typeof SignalHubStoreConfig>;
