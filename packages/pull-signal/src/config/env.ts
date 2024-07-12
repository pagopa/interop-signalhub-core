import { z } from "zod";
import {
  HTTPServerConfig,
  SignalHubStoreConfig,
  InteropClientConfig,
  JWTConfig,
} from "pagopa-signalhub-commons";

const PullServiceConfig = HTTPServerConfig.and(SignalHubStoreConfig)
  .and(InteropClientConfig)
  .and(JWTConfig);

export type PullServiceConfig = z.infer<typeof PullServiceConfig>;

const parsedFromEnv = PullServiceConfig.safeParse(process.env);
if (!parsedFromEnv.success) {
  const invalidEnvVars = parsedFromEnv.error.issues.flatMap(
    (issue) => issue.path
  );
  // eslint-disable-next-line no-console
  console.error(
    "Invalid or missing env vars: Pull Service  " + invalidEnvVars.join(", ")
  );
  process.exit(1);
}

export const config: PullServiceConfig = {
  ...parsedFromEnv.data,
};
