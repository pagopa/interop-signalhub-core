import { z } from "zod";

export const ConsumerConfig = z
  .object({
    CONSUMER_POLLING_TIMEOUT_IN_SECONDS: z.coerce.number().min(1),
  })
  .transform((c) => ({
    consumerPollingTimeout: c.CONSUMER_POLLING_TIMEOUT_IN_SECONDS,
  }));

export type ConsumerConfig = z.infer<typeof ConsumerConfig>;

export const consumerConfig: () => ConsumerConfig = () =>
  ConsumerConfig.parse(process.env);
