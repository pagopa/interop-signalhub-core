import { z } from "zod";

export const QuequeConfig = z
  .object({
    QUEUE_URL: z.string(),
    QUEUE_ENDPOINT: z.string(),
    QUEUE_NAME: z.string(),
    QUEUE_PORT: z.coerce.number().min(1001),
  })
  .transform((c) => ({
    queueUrl: c.QUEUE_URL,
    queueEndpoint: c.QUEUE_ENDPOINT,
    queueName: c.QUEUE_NAME,
    queuePort: c.QUEUE_PORT,
  }));

export type QuequeConfig = z.infer<typeof QuequeConfig>;
