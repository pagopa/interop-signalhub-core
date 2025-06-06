import { SnakeCase } from "pagopa-signalhub-commons";
import { z } from "zod";

export const AgreementEntity = z.object({
  agreementId: z.string(),
  eserviceId: z.string(),
  descriptorId: z.string(),
  consumerId: z.string(),
  state: z.string(),
  eventStreamId: z.string(),
  eventVersionId: z.number(),
  tmstInsert: z.string().nullable().optional(),
  tmstLastEdit: z.string().nullable().optional()
});

export type AgreementEntity = SnakeCase<z.infer<typeof AgreementEntity>>;
