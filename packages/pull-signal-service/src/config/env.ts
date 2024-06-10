import { z } from "zod";
import {
  HTTPServerConfig,
  SignalHubStoreConfig,
  QuequeConfig,
  AwsConfig,
} from "signalhub-commons";

const PullServiceConfig = HTTPServerConfig.and(SignalHubStoreConfig)
  .and(QuequeConfig)
  .and(AwsConfig);

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
  ...parsedFromEnv.data,
};
