import { SnakeCase } from "pagopa-signalhub-commons";
import { z } from "zod";

export const AgreementEntity = z.object({
  agreementId: z.string(),
  consumerId: z.string(),
  descriptorId: z.string(),
  eserviceId: z.string(),
  eventStreamId: z.string(),
  eventVersionId: z.number(),
  state: z.string(),
  tmstInsert: z.string().nullable().optional(),
  tmstLastEdit: z.string().nullable().optional(),
});

export type AgreementEntity = SnakeCase<z.infer<typeof AgreementEntity>>;
