import { z } from "zod";
import { SnakeCase } from "../utils/index.js";
import { DatabaseNameSpace } from "../index.js";

export const TracingBatch = z.object({
  batchId: z.string(),
  lastEventId: z.string(),
  type: z.string(),
  state: z.string(),
  tmstCreated: z.string(),
});

export const TracingBatchCleanup = z.object({
  batchId: z.number().nullish(),
  tmstStartAt: z.string().nullish(),
  tmstEndAt: z.string().nullish(),
  error: z.unknown().optional().nullish(),
  tmstDeleteFrom: z.string().optional().nullish(),
  countDeleted: z.number().optional().nullish(),
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

export const Agreement = z.object({
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
export type Agreement = z.infer<typeof Agreement>;
export type TracingBatch = z.infer<typeof TracingBatch>;
export type TracingBatchCleanup = z.infer<typeof TracingBatchCleanup>;

export type ProducerEserviceEntity = SnakeCase<z.infer<typeof ProducerService>>;
export type AgreementEntity = SnakeCase<z.infer<typeof Agreement>>;
export type TracingBatchEntity = SnakeCase<z.infer<typeof TracingBatch>>;

type InteropDatabaseTable = "eservice" | "purpose" | "agreement";
export type TableName =
  | `${DatabaseNameSpace}_SIGNAL.signal`
  | `${DatabaseNameSpace}_INTEROP.${InteropDatabaseTable}`;
