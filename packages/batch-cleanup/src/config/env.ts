import { SignalHubStoreConfig } from "pagopa-signalhub-commons";
import { z } from "zod";

const ClenaupConfig = z
  .object({
    SIGNALS_RETENTION_HOURS: z.coerce.number().min(1)
  })
  .transform((c) => ({
    signalsRetentionHours: c.SIGNALS_RETENTION_HOURS
  }));

const BatchCleanupConfig = SignalHubStoreConfig.and(ClenaupConfig);

export type BatchCleanupConfig = z.infer<typeof BatchCleanupConfig>;

const parsedFromEnv = BatchCleanupConfig.safeParse(process.env);
if (!parsedFromEnv.success) {
  const invalidEnvVars = parsedFromEnv.error.issues.flatMap(
    (issue) => issue.path
  );

  console.error(
    "Invalid or missing env vars: Batch Cleanup " + invalidEnvVars.join(", ")
  );
  process.exit(1);
}

export const config: BatchCleanupConfig = {
  ...parsedFromEnv.data
};
