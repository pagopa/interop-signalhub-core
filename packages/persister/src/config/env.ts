import { z } from "zod";
import {
  SignalHubStoreConfig,
  QuequeConfig,
  AwsConfig,
} from "signalhub-commons";

const PersisterServiceConfig =
  SignalHubStoreConfig.and(QuequeConfig).and(AwsConfig);

const parsedFromEnv = PersisterServiceConfig.safeParse(process.env);
if (!parsedFromEnv.success) {
  const invalidEnvVars = parsedFromEnv.error.issues.flatMap(
    (issue) => issue.path
  );
  // eslint-disable-next-line no-console
  console.error(
    "Invalid or missing env vars: Persister Service  " +
      invalidEnvVars.join(", ")
  );
  process.exit(1);
}

export type PersisterServiceConfig = z.infer<typeof PersisterServiceConfig>;

export const config: PersisterServiceConfig = {
  ...parsedFromEnv.data,
};
