import { z } from "zod";

export const PurposeEntity = z.object({
  consumerId: z.string(),
  eserviceId: z.string(),
  eventStreamId: z.string(),
  eventVersionId: z.number(),
  purposeId: z.string(),
  purposeState: z.string(),
  purposeVersionId: z.string(),
  tmstInsert: z.string().nullable().optional(),
  tmstLastEdit: z.string().nullable().optional(),
});

export type PurposeEntity = z.infer<typeof PurposeEntity>;
