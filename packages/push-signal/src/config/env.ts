import {
  APIServiceConfig,
  HTTPServerConfig,
  JWTConfig,
  QuequeConfig,
  RedisRateLimiterConfig,
  SignalHubStoreConfig
} from "pagopa-signalhub-commons";
import { z } from "zod";

const PushServiceConfig = HTTPServerConfig.and(SignalHubStoreConfig)
  .and(QuequeConfig)
  .and(JWTConfig)
  .and(APIServiceConfig)
  .and(RedisRateLimiterConfig)
  .and(
    z
      .object({
        FEATURE_FLAG_TIME_WINDOW: z
          .enum(["true", "false"])
          .default("false")
          .transform((value) => value === "true"),
        TIME_WINDOW_DURATION_IN_SECONDS: z
          .string()
          .transform((value) => parseInt(value, 10))
      })
      .transform((c) => ({
        featureFlagTimeWindow: c.FEATURE_FLAG_TIME_WINDOW,
        timeWindowInSeconds: c.TIME_WINDOW_DURATION_IN_SECONDS
      }))
  );
export type PushServiceConfig = z.infer<typeof PushServiceConfig>;

const parsedFromEnv = PushServiceConfig.safeParse(process.env);
if (!parsedFromEnv.success) {
  const invalidEnvVars = parsedFromEnv.error.issues.flatMap(
    (issue) => issue.path
  );

  console.error(
    "Invalid or missing env vars: Push Service  " + invalidEnvVars.join(", ")
  );
  process.exit(1);
}

export const config: PushServiceConfig = {
  ...parsedFromEnv.data
};
