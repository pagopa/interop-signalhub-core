import { z } from "zod";
import { SnakeCase } from "../utils/index.js";

export const TracingBatch = z.object({
  batchId: z.string(),
  lastEventId: z.string(),
  type: z.string(),
  state: z.string(),
  tmstCreated: z.string(),
});

export const ProducerService = z.object({
  eventId: z.number(),
  eserviceId: z.string(),
  producerId: z.string(),
  agreementId: z.string(),
  descriptorId: z.string(),
  state: z.string(),
  tmstInsert: z.string(),
  tmstLastEdit: z.string(),
});

export const ConsumerEservice = z.object({
  eventId: z.number(),
  eserviceId: z.string(),
  producerId: z.string(),
  consumerId: z.string(),
  agreementId: z.string(),
  descriptorId: z.string(),
  state: z.string(),
  tmstInsert: z.string().optional(),
  tmstLastEdit: z.string().optional(),
});

export type ProducerService = z.infer<typeof ProducerService>;
export type ConsumerEservice = z.infer<typeof ConsumerEservice>;
export type TracingBatch = z.infer<typeof TracingBatch>;

export type ProducerEserviceEntity = SnakeCase<z.infer<typeof ProducerService>>;
export type ConsumerEserviceEntity = SnakeCase<
  z.infer<typeof ConsumerEservice>
>;
export type TracingBatchEntity = SnakeCase<z.infer<typeof TracingBatch>>;
