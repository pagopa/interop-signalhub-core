import { Event } from "signalhub-interop-client";
import { z } from "zod";

export const TracingBatchEntity = z.object({
  batch_id: z.string(),
  last_event_id: z.string(),
  type: z.string(),
  state: z.string(),
  tmst_created: z.string(),
});

export const ProducerEserviceEntity = z.object({
  eventId: z.number(),
  eserviceId: z.string(),
  producerId: z.string(),
  agreementId: z.string(),
  descriptorId: z.string(),
  state: z.string(),
  tmstInsert: z.string(),
  tmstLastEdit: z.string(),
});

export const ConsumerEserviceEntity = z.object({
  eventId: z.number(),
  eserviceId: z.string(),
  producerId: z.string(),
  agreementId: z.string(),
  descriptorId: z.string(),
  state: z.string(),
});

export type ProducerEserviceEntity = z.infer<typeof ProducerEserviceEntity>;
export type ConsumerEserviceEntity = z.infer<typeof ConsumerEserviceEntity>;
export type TracingBatchEntity = z.infer<typeof TracingBatchEntity>;

export enum TracingBatchStateEnum {
  ENDED = "ENDED",
  ENDED_WITH_ERROR = "ENDED_WITH_ERROR",
}

export interface AgreementEventDto extends Event {
  agreementId: string;
  descriptorId: string;
}

export interface EserviceEventDto extends Event {
  eserviceId: string;
  descriptorId: string;
}
