import { DB, Signal } from "signalhub-commons";

export async function writeSignal(partialSignal: Partial<Signal>, db: DB) {
  const signal: Signal = {
    signalId: Math.random(),
    eserviceId: "eservice-id-test",
    objectId: "object-id-test",
    objectType: "object-type-test",
    correlationId: "correlation-id-test",
    signalType: "CREATE",

    ...partialSignal,
  };
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
