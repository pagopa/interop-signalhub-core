import {
  FileManagerConfig,
  SignalHubStoreConfig
} from "pagopa-signalhub-commons";
import { z } from "zod";

const DatalakeStorageConfig = z
  .object({
    DATALAKE_STORAGE_BUCKET: z.string()
  })
  .transform((c) => ({
    dataLakeStorageBucket: c.DATALAKE_STORAGE_BUCKET
  }));

const DatalakeDataExporterConfig = SignalHubStoreConfig.and(
  FileManagerConfig
).and(DatalakeStorageConfig);

export type DatalakeDataExporterConfig = z.infer<
  typeof DatalakeDataExporterConfig
>;

const parsedFromEnv = DatalakeDataExporterConfig.safeParse(process.env);
if (!parsedFromEnv.success) {
  const invalidEnvVars = parsedFromEnv.error.issues.flatMap(
    (issue) => issue.path
  );

  console.error(
    "Invalid or missing env vars: Datalake Data Exporter " +
      invalidEnvVars.join(", ")
  );
  process.exit(1);
}

export const config: DatalakeDataExporterConfig = {
  ...parsedFromEnv.data
};
