import { z } from "zod";

export const QuequeConfig = z
  .object({
    QUEUE_URL: z.string(),
    QUEUE_ENDPOINT: z.string(),
  })
  .transform((c) => ({
    queueUrl: c.QUEUE_URL,
    queueEndpoint: c.QUEUE_ENDPOINT,
  }));

export type QuequeConfig = z.infer<typeof QuequeConfig>;
