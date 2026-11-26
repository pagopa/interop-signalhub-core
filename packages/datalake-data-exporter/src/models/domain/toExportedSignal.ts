import { SignalRecord } from "pagopa-signalhub-commons";

import { ExportedSignal } from "./model.js";

export function toExportedSignal(record: SignalRecord): ExportedSignal {
  return {
    signalId: Number(record.signal_id),
    eserviceId: record.eservice_id,
    signalType: record.signal_type,
    tmstInsert: record.tmst_insert
  };
}
