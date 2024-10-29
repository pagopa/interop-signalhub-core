import { SignalRecord, SignalResponse } from "pagopa-signalhub-commons";

export function toSignalResponse(record: SignalRecord): SignalResponse {
  return {
    eserviceId: record.eservice_id,
    objectId: record.object_id,
    objectType: record.object_type,
    signalId: Number(record.signal_id),
    signalType: record.signal_type,
  };
}
