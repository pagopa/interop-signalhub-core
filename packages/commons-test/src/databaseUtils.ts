import { DB, Signal } from "signalhub-commons";

export async function writeSignal(signal: Signal, db: DB) {
  try {
    return await db.oneOrNone(
      "INSERT INTO SIGNAL(correlation_id, signal_id,object_id,eservice_id, object_type, signal_type) VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
      [
        signal.correlationId,
        signal.signalId,
        signal.objectId,
        signal.eserviceId,
        signal.objectType,
        signal.signalType,
      ],
      (rec) => rec.id
    );
  } catch (err) {
    throw err;
  }
}
