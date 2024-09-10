import { z } from "zod";

export const PurposeEntity = z.object({
  purposeId: z.string(),
  purposeVersionId: z.string(),
  eserviceId: z.string(),
  consumerId: z.string(),
  purposeState: z.string(),
  eventStreamId: z.string(),
  eventVersionId: z.number(),
  tmstInsert: z.string().nullable().optional(),
  tmstLastEdit: z.string().nullable().optional(),
});

export type PurposeEntity = z.infer<typeof PurposeEntity>;
