import { SignalHubStoreConfig } from "signalhub-commons";
import { z } from "zod";

const UpdaterConfig = z
  .object({
    ATTEMPT_EVENT: z.coerce.number(),
  })
  .transform((c) => ({
    attemptEvent: c.ATTEMPT_EVENT,
  }));

const UpdaterServiceConfig = SignalHubStoreConfig.and(UpdaterConfig);

export type UpdaterServiceConfigType = z.infer<typeof UpdaterServiceConfig>;

const parsedFromEnv = UpdaterServiceConfig.safeParse(process.env);
if (!parsedFromEnv.success) {
  const invalidEnvVars = parsedFromEnv.error.issues.flatMap(
    (issue) => issue.path
  );
  console.error(
    "Invalid or missing env vars: Updater Service  " + invalidEnvVars.join(", ")
  );
  process.exit(1);
}

export const config: UpdaterServiceConfigType = {
  ...parsedFromEnv.data,
};
