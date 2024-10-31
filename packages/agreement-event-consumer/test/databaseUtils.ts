import { InteropSchema, TableName } from "pagopa-signalhub-commons";

import { AgreementEntity } from "../src/models/domain/model.js";
import { postgresDB } from "./utils.js";

export const getAnAgreementEntityBy = async (
  agreementId: string
): Promise<AgreementEntity | null> => {
  const agreement = await postgresDB.oneOrNone(
    "SELECT agreement_id, eservice_id, consumer_id, descriptor_id, state, event_stream_id, event_version_id FROM dev_interop.agreement a WHERE a.agreement_id = $1",
    [agreementId]
  );
  if (!agreement) {
    return null;
  }
  return {
    ...agreement,
    event_version_id: Number(agreement.event_version_id)
  };
};
export const writeAnAgreementEntity = async (
  agreement: AgreementEntity,
  schema: InteropSchema
): Promise<void> => {
  const {
    agreement_id,
    eservice_id,
    consumer_id,
    descriptor_id,
    state,
    event_stream_id,
    event_version_id
  } = agreement;

  const agreementTable: TableName = `${schema}.agreement`;
  await postgresDB.oneOrNone(
    `INSERT INTO ${agreementTable}(agreement_id, eservice_id, consumer_id, descriptor_id, state, event_stream_id, event_version_id) VALUES($1, $2, $3, $4, $5, $6, $7)`,
    [
      agreement_id,
      eservice_id,
      consumer_id,
      descriptor_id,
      state,
      event_stream_id,
      event_version_id
    ]
  );
};
