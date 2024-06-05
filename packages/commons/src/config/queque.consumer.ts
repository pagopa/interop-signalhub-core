import { z } from "zod";

export const QuequeConsumerConfig = z
  .object({
    CONSUMER_POLLING_TIMEOUT_IN_SECONDS: z.coerce.number().min(1),
  })
  .transform((c) => ({
    consumerPollingTimeout: c.CONSUMER_POLLING_TIMEOUT_IN_SECONDS,
  }));

export type QuequeConsumerConfig = z.infer<typeof QuequeConsumerConfig>;
