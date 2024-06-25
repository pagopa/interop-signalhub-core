import { z } from "zod";
import {
  HTTPServerConfig,
  SignalHubStoreConfig,
  QuequeConfig,
  AwsConfig,
  InteropClientConfig,
  JWTConfig,
} from "signalhub-commons";

const PushServiceConfig = HTTPServerConfig.and(SignalHubStoreConfig)
  .and(QuequeConfig)
  .and(AwsConfig)
  .and(InteropClientConfig)
  .and(JWTConfig);

export type PushServiceConfig = z.infer<typeof PushServiceConfig>;

const parsedFromEnv = PushServiceConfig.safeParse(process.env);
if (!parsedFromEnv.success) {
  const invalidEnvVars = parsedFromEnv.error.issues.flatMap(
    (issue) => issue.path
  );
  // eslint-disable-next-line no-console
  console.error(
    "Invalid or missing env vars: Push Service  " + invalidEnvVars.join(", ")
  );
  process.exit(1);
}

export const config: PushServiceConfig = {
  ...parsedFromEnv.data,
};
