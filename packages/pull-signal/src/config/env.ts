import {
  APIServiceConfig,
  HTTPServerConfig,
  JWTConfig,
  RedisRateLimiterConfig,
  SignalHubStoreConfig
} from "pagopa-signalhub-commons";
import { z } from "zod";

const PullServiceConfig = HTTPServerConfig.and(SignalHubStoreConfig)
  .and(JWTConfig)
  .and(APIServiceConfig)
  .and(RedisRateLimiterConfig)
  .and(
    z
      .object({
        FEATURE_FLAG_SIGNALHUB_WHITELIST: z
          .enum(["true", "false"])
          .default("false")
          .transform((value) => value === "true"),
        SIGNALHUB_WHITELIST: z
          .string()
          .transform((value) => value.split(","))
          .pipe(z.array(z.string().uuid()))
          .optional()
      })
      .transform((c) => ({
        featureFlagSignalhubWhitelist: c.FEATURE_FLAG_SIGNALHUB_WHITELIST,
        signalhubWhitelist: c.SIGNALHUB_WHITELIST
      }))
  );

export type PullServiceConfig = z.infer<typeof PullServiceConfig>;

const parsedFromEnv = PullServiceConfig.safeParse(process.env);
if (!parsedFromEnv.success) {
  const invalidEnvVars = parsedFromEnv.error.issues.flatMap(
    (issue) => issue.path
  );
  console.error(
    "Invalid or missing env vars: Pull Service  " + invalidEnvVars.join(", ")
  );
  process.exit(1);
}

export const config: PullServiceConfig = {
  ...parsedFromEnv.data
};
