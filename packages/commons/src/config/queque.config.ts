import { z } from "zod";

export const QuequeConfig = z
  .object({
    QUEUE_URL: z.string()
  })
  .transform((c) => ({
    queueUrl: c.QUEUE_URL
  }));

export type QuequeConfig = z.infer<typeof QuequeConfig>;
