import { z } from "zod";

import { InteropSchema, SignalhubSchema } from "../index.js";
import { SnakeCase } from "../utils/index.js";

export const TracingBatch = z.object({
  batchId: z.string(),
  lastEventId: z.string(),
  state: z.string(),
  tmstCreated: z.string(),
  type: z.string(),
});

export const TracingBatchCleanup = z.object({
  batchId: z.number().nullish(),
  countDeleted: z.number().optional().nullish(),
  error: z.unknown().optional().nullish(),
  tmstDeleteFrom: z.string().optional().nullish(),
  tmstEndAt: z.string().nullish(),
  tmstStartAt: z.string().nullish(),
});

export const ProducerService = z.object({
  agreementId: z.string(),
  descriptorId: z.string(),
  enabledSignalHub: z.boolean().optional(),
  eserviceId: z.string(),
  producerId: z.string(),
  state: z.string(),
  tmstInsert: z.string(),
  tmstLastEdit: z.string(),
});

export const Agreement = z.object({
  agreementId: z.string(),
  consumerId: z.string(),
  descriptorId: z.string(),
  eserviceId: z.string(),
  producerId: z.string(),
  state: z.string(),
  tmstInsert: z.string().optional(),
  tmstLastEdit: z.string().optional(),
});

export type ProducerService = z.infer<typeof ProducerService>;
export type Agreement = z.infer<typeof Agreement>;
export type TracingBatch = z.infer<typeof TracingBatch>;
export type TracingBatchCleanup = z.infer<typeof TracingBatchCleanup>;

export type ProducerEserviceEntity = SnakeCase<z.infer<typeof ProducerService>>;
export type AgreementEntity = SnakeCase<z.infer<typeof Agreement>>;
export type TracingBatchEntity = SnakeCase<z.infer<typeof TracingBatch>>;

type InteropDatabaseTable =
  | "agreement"
  | "eservice"
  | "eservice_producer"
  | "purpose";

type SignalHubDatabaseTable =
  | "dead_signal"
  | "signal"
  | "tracing_batch_cleanup";

export type TableName =
  | `${InteropSchema}.${InteropDatabaseTable}`
  | `${SignalhubSchema}.${SignalHubDatabaseTable}`;
