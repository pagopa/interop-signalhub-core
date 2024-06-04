import { z } from "zod";

export const QuequeConfig = z
  .object({
    QUEUE_URL: z.string(),
    AWS_REGION: z.string(),
    QUEUE_ENDPOINT: z.string(),
  })
  .transform((c) => ({
    queueUrl: c.QUEUE_URL,
    region: c.AWS_REGION,
    queueEndpoint: c.QUEUE_ENDPOINT,
  }));

export type QuequeConfig = z.infer<typeof QuequeConfig>;

export const config: QuequeConfig = {
  ...QuequeConfig.parse(process.env),
};
