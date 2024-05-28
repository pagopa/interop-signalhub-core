import { z } from "zod";
import { HTTPServerConfig } from "signalhub-commons";
import { PersisterServiceConfig } from "./db.js";
import { SqsPersisterServiceConfig } from "./sqs.js";

const envConfig = HTTPServerConfig.and(SqsPersisterServiceConfig).and(
  PersisterServiceConfig
);

const parsedFromEnv = envConfig.safeParse(process.env);

if (!parsedFromEnv.success) {
  const invalidEnvVars = parsedFromEnv.error.issues.flatMap(
    (issue) => issue.path
  );
  console.error("Invalid or missing env vars: " + invalidEnvVars.join(", "));
  process.exit(1);
}

export type EnvConfig = z.infer<typeof envConfig>;

export const config: EnvConfig = {
  ...envConfig.parse(process.env),
};
