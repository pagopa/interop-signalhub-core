import { PurposeEntity } from "../src/models/domain/model.js";
import { postgresDB, toPurposeEntity } from "./utils.js";

export const getAPurposeEntityBy = async (
  purposeId: string
): Promise<PurposeEntity | null> => {
  const purpose = await postgresDB.oneOrNone(
    "SELECT purpose_id, purpose_version_id, purpose_state, eservice_id, consumer_id, event_stream_id, event_version_id FROM dev_interop.purpose p WHERE p.purpose_id = $1",
    [purposeId]
  );
  if (!purpose) {
    return null;
  }
  return toPurposeEntity(purpose);
};
export const writeAPurposeEntity = async (
  purpose: PurposeEntity
): Promise<void> => {
  const {
    purposeId,
    purposeVersionId,
    purposeState,
    eserviceId,
    consumerId,
    eventStreamId,
    eventVersionId,
  } = purpose;
  await postgresDB.oneOrNone(
    "INSERT INTO dev_interop.purpose(purpose_id, purpose_version_id, purpose_state, eservice_id, consumer_id, event_stream_id, event_version_id) VALUES($1, $2, $3, $4, $5, $6, $7)",
    [
      purposeId,
      purposeVersionId,
      purposeState,
      eserviceId,
      consumerId,
      eventStreamId,
      eventVersionId,
    ]
  );
};
