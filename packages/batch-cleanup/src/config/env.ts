import { SignalHubStoreConfig } from "signalhub-commons";
import { z } from "zod";

const UpdaterConfig = z
  .object({
    SIGNALS_RETENTION_HOURS: z.coerce.number().min(1),
  })
  .transform((c) => ({
    signalsRetentionHours: c.SIGNALS_RETENTION_HOURS,
  }));

const BatchCleanupConfig = SignalHubStoreConfig.and(UpdaterConfig);

export type BatchCleanupConfig = z.infer<typeof BatchCleanupConfig>;

const parsedFromEnv = BatchCleanupConfig.safeParse(process.env);
if (!parsedFromEnv.success) {
  const invalidEnvVars = parsedFromEnv.error.issues.flatMap(
    (issue) => issue.path
  );

  // eslint-disable-next-line no-console
  console.error(
    "Invalid or missing env vars: Batch Cleanup " + invalidEnvVars.join(", ")
  );
  process.exit(1);
}

export const config: BatchCleanupConfig = {
  ...parsedFromEnv.data,
};
