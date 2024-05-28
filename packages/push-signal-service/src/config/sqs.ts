import { z } from "zod";

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

export type PeristerServiceConfig = z.infer<typeof SqsPersisterServiceConfig>;

export const config: PeristerServiceConfig = {
  ...SqsPersisterServiceConfig.parse(process.env),
};
