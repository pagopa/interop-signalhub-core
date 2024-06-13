import { DB, Signal, SignalRequest } from "signalhub-commons";

export async function writeSignal(
  signal: Partial<Signal>,
  db: DB
): Promise<unknown> {
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
}

export const createSignal = (partialSignal?: Partial<Signal>): Signal => ({
  ...createSignalRequest(),
  correlationId: `correlation-id-test-${getRandomInt()}`,

  ...partialSignal,
});

export const createSignalRequest = (
  partialSignal?: Partial<SignalRequest>
): SignalRequest => ({
  signalId: getRandomInt(),
  eserviceId: "eservice-id-test",
  objectId: "object-id-test",
  objectType: "object-type-test",
  signalType: "CREATE",

  ...partialSignal,
});

const getRandomInt = (): number =>
  Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
