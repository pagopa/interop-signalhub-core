import { z } from "zod";

const interopSchema = z.enum(["DEV_INTEROP", "UAT_INTEROP", "PROD_INTEROP"]);
const signalhubSchema = z.enum([
  "DEV_SIGNALHUB",
  "UAT_SIGNALHUB",
  "PROD_SIGNALHUB",
]);

export const SignalHubStoreConfig = z
  .object({
    SH_DB_HOST: z.string(),
    SH_DB_NAME: z.string(),
    SH_DB_USERNAME: z.string(),
    SH_DB_PASSWORD: z.string(),
    SH_DB_PORT: z.coerce.number().min(1001),
    SH_DB_INTEROP_SCHEMA: interopSchema,
    SH_DB_SIGNALHUB_SCHEMA: signalhubSchema,
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
    signalhubStoreDbUseSSL: c.SH_DB_USE_SSL,
    signalHubSchema: c.SH_DB_SIGNALHUB_SCHEMA,
    interopSchema: c.SH_DB_INTEROP_SCHEMA,
  }));

export type SignalHubStoreConfig = z.infer<typeof SignalHubStoreConfig>;
export type InteropSchema = z.infer<typeof interopSchema>;
export type SignalhubSchema = z.infer<typeof signalhubSchema>;
