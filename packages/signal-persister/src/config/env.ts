import { QuequeConfig, SignalHubStoreConfig } from "pagopa-signalhub-commons";
import { z } from "zod";

const PersisterServiceConfig = SignalHubStoreConfig.and(QuequeConfig);

const parsedFromEnv = PersisterServiceConfig.safeParse(process.env);
if (!parsedFromEnv.success) {
  const invalidEnvVars = parsedFromEnv.error.issues.flatMap(
    (issue) => issue.path
  );
  console.error(
    "Invalid or missing env vars: Persister Service  " +
      invalidEnvVars.join(", ")
  );
  process.exit(1);
}

export type PersisterServiceConfig = z.infer<typeof PersisterServiceConfig>;

export const config: PersisterServiceConfig = {
  ...parsedFromEnv.data
};
