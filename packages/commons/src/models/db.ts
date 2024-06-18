import { z } from "zod";
import { Camelize } from "../utils/index.js";

export const TracingBatchEntity = z.object({
  batch_id: z.string(),
  last_event_id: z.string(),
  type: z.string(),
  state: z.string(),
  tmst_created: z.string(),
});

export const ProducerEserviceEntity = z.object({
  event_id: z.number(),
  eservice_id: z.string(),
  producer_id: z.string(),
  agreement_id: z.string(),
  descriptor_id: z.string(),
  state: z.string(),
  tmst_insert: z.string(),
  tmst_last_edit: z.string(),
});

export const ConsumerEserviceEntity = z.object({
  event_id: z.number(),
  eservice_id: z.string(),
  producer_id: z.string(),
  agreement_id: z.string(),
  descriptor_id: z.string(),
  state: z.string(),
});

export type ProducerEserviceEntity = z.infer<typeof ProducerEserviceEntity>;
export type ConsumerEserviceEntity = z.infer<typeof ConsumerEserviceEntity>;
export type TracingBatchEntity = z.infer<typeof TracingBatchEntity>;

export type ProducerEserviceDto = Camelize<
  z.infer<typeof ProducerEserviceEntity>
>;
export type ConsumerEserviceDto = Camelize<
  z.infer<typeof ConsumerEserviceEntity>
>;
export type TracingBatchDto = Camelize<z.infer<typeof TracingBatchEntity>>;
