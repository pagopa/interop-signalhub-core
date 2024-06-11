import { DB, Signal, SignalPayload } from "signalhub-commons";

export async function writeSignal(signal: Partial<Signal>, db: DB) {
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

export const createSignal = (partialSignal?: Partial<Signal>): Signal => {
  return {
    ...createSignalPayload(),
    correlationId: `correlation-id-test-${getRandomInt()}`,

    ...partialSignal,
  };
};

export const createSignalPayload = (
  partialSignal?: Partial<SignalPayload>
): SignalPayload => {
  return {
    signalId: getRandomInt(),
    eserviceId: "eservice-id-test",
    objectId: "object-id-test",
    objectType: "object-type-test",
    signalType: "CREATE",

    ...partialSignal,
  };
};

const getRandomInt = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
