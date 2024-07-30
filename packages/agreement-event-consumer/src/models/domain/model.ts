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
  tmstInsert: z.string().optional(),
  tmstLastEdit: z.string().optional(),
});

export type AgreementEntity = SnakeCase<z.infer<typeof AgreementEntity>>;
