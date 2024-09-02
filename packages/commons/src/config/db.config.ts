import { z } from "zod";

type Env = "dev" | "uat" | "prod";
type UpperAndLower<T extends string> = T | Uppercase<T>;
type DatabaseEnv = UpperAndLower<Env>;

export type InteropSchema = `${DatabaseEnv}_${UpperAndLower<"interop">}`;
export type SignalhubSchema = `${DatabaseEnv}_${UpperAndLower<"signalhub">}`;

export const SignalHubStoreConfig = z
  .object({
    SH_DB_HOST: z.string(),
    SH_DB_NAME: z.string(),
    SH_DB_USERNAME: z.string(),
    SH_DB_PASSWORD: z.string(),
    SH_DB_PORT: z.coerce.number().min(1001),
    SH_DB_INTEROP_SCHEMA: z.custom<InteropSchema>(),
    SH_DB_SIGNALHUB_SCHEMA: z.custom<SignalhubSchema>(),
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
