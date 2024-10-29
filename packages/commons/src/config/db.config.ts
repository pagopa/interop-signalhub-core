import { z } from "zod";

type Env = "dev" | "prod" | "uat";
type UpperAndLower<T extends string> = T | Uppercase<T>;
type DatabaseEnv = UpperAndLower<Env>;

export type InteropSchema = `${DatabaseEnv}_${UpperAndLower<"interop">}`;
export type SignalhubSchema = `${DatabaseEnv}_${UpperAndLower<"signalhub">}`;

export const SignalHubStoreConfig = z
  .object({
    SH_DB_HOST: z.string(),
    SH_DB_INTEROP_SCHEMA: z.custom<InteropSchema>(),
    SH_DB_NAME: z.string(),
    SH_DB_PASSWORD: z.string(),
    SH_DB_PORT: z.coerce.number().min(1001),
    SH_DB_SIGNALHUB_SCHEMA: z.custom<SignalhubSchema>(),
    SH_DB_USE_SSL: z
      .enum(["true", "false"])
      .transform((value) => value === "true"),
    SH_DB_USERNAME: z.string(),
    SH_MAX_CONNECTION_POOL: z.coerce.number().default(10),
  })
  .transform((c) => ({
    interopSchema: c.SH_DB_INTEROP_SCHEMA,
    maxConnectionPool: c.SH_MAX_CONNECTION_POOL,
    signalHubSchema: c.SH_DB_SIGNALHUB_SCHEMA,
    signalhubStoreDbHost: c.SH_DB_HOST,
    signalhubStoreDbName: c.SH_DB_NAME,
    signalhubStoreDbPassword: encodeURIComponent(c.SH_DB_PASSWORD),
    signalhubStoreDbPort: c.SH_DB_PORT,
    signalhubStoreDbUseSSL: c.SH_DB_USE_SSL,
    signalhubStoreDbUsername: c.SH_DB_USERNAME,
  }));

export type SignalHubStoreConfig = z.infer<typeof SignalHubStoreConfig>;
