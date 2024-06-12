import { SignalHubStoreConfig } from "signalhub-commons";
import { z } from "zod";

const UpdaterConfig = z
  .object({
    APPLICATION_TYPE: z.enum(["AGREEMENT", "ESERVICES"]),
    ATTEMPT_EVENT: z.coerce.number(),
  })
  .transform((c) => ({
    applicationType: c.APPLICATION_TYPE,
    attemptEvent: c.ATTEMPT_EVENT,
  }));

const UpdaterServiceConfig = SignalHubStoreConfig.and(UpdaterConfig);

export type UpdaterServiceConfigType = z.infer<typeof UpdaterServiceConfig>;
export type ApplicationType = z.infer<typeof UpdaterConfig>["applicationType"];

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
