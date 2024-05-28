import { z } from "zod";
import { HTTPServerConfig } from "signalhub-commons";

export const SqsPersisterServiceConfig = z
  .object({
    QUEUE_URL: z.string(),
    REGION: z.string(),
    QUEUE_ENDPOINT: z.string(),
  })
  .transform((c) => ({
    queueUrl: c.QUEUE_URL,
    region: c.REGION,
    queueEndpoint: c.QUEUE_ENDPOINT,
  }));

const parsedConfigFromEnv = SqsPersisterServiceConfig.safeParse(process.env);

if (!parsedConfigFromEnv.success) {
  const invalidEnvVars = parsedConfigFromEnv.error.issues.flatMap(
    (issue) => issue.path
  );
  console.error("Invalid or missing env vars: " + invalidEnvVars.join(", "));
  process.exit(1);
}

const PeristerServiceConfig = HTTPServerConfig.and(SqsPersisterServiceConfig);

export type PeristerServiceConfig = z.infer<typeof PeristerServiceConfig>;

export const config: PeristerServiceConfig = {
  ...PeristerServiceConfig.parse(process.env),
};
