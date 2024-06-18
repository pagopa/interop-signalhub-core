import { SignalRecord, SignalResponse } from "signalhub-commons";

export function toSignalResponse(record: SignalRecord): SignalResponse {
  return {
    signalId: Number(record.signal_id),
    signalType: record.signal_type,
    objectId: record.object_id,
    eserviceId: record.eservice_id,
    objectType: record.object_type,
  };
}
