import { AgreementEntity } from "../src/models/domain/model.js";
import { postgresDB } from "./utils";

export const getAnAgreementBy = async (
  agreementId: string
): Promise<AgreementEntity | null> => {
  const agreement = await postgresDB.oneOrNone(
    "SELECT * FROM dev_interop.agreement a WHERE a.agreement_id = $1",
    [agreementId]
  );
  if (!agreement) {
    return null;
  }
  return {
    ...agreement,
    event_version_id: Number(agreement.event_version_id),
    event_id: Number(agreement.event_id),
    tmst_insert: null,
    tmst_last_edit: null,
  };
};
export const writeAnAgreement = async (
  agreement: AgreementEntity
): Promise<void> => {
  const {
    agreement_id,
    eservice_id,
    consumer_id,
    descriptor_id,
    state,
    event_stream_id,
    event_version_id,
  } = agreement;
  await postgresDB.oneOrNone(
    "INSERT INTO dev_interop.agreement(agreement_id, eservice_id, consumer_id, descriptor_id, state, event_stream_id, event_version_id) VALUES($1, $2, $3, $4, $5, $6, $7)",
    [
      agreement_id,
      eservice_id,
      consumer_id,
      descriptor_id,
      state,
      event_stream_id,
      event_version_id,
    ]
  );
};
