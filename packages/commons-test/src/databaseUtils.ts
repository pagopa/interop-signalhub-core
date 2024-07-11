import { DB, Signal, SignalPayload } from "pagopa-signalhub-commons";

export async function truncateConsumerEserviceTable(db: DB): Promise<void> {
  await db.none("truncate dev_interop.consumer_eservice;");
}
export async function truncateEserviceTable(db: DB): Promise<void> {
  await db.none("truncate dev_interop.eservice;");
}

export async function truncateSignalTable(db: DB): Promise<void> {
  await db.none("truncate dev_signalhub.signal;");
}

export async function truncateDeadSignalTable(db: DB): Promise<void> {
  await db.none("truncate dev_signalhub.dead_signal;");
}

export async function truncateTracingBatchTable(db: DB): Promise<void> {
  await db.none("truncate dev_interop.tracing_batch;");
}

export async function writeSignal(
  signal: Partial<Signal>,
  db: DB
): Promise<unknown> {
  return await db.oneOrNone(
    "INSERT INTO DEV_SIGNALHUB.SIGNAL(correlation_id, signal_id,object_id,eservice_id, object_type, signal_type) VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
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

export async function writeSignals(
  signals: Array<Partial<Signal>>,
  db: DB
): Promise<number[]> {
  const ids: number[] = [];
  for (const signal of signals) {
    // eslint-disable-next-line functional/immutable-data
    ids.push(
      await db.oneOrNone(
        "INSERT INTO DEV_SIGNALHUB.SIGNAL(correlation_id, signal_id,object_id,eservice_id, object_type, signal_type) VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
        [
          signal.correlationId,
          signal.signalId,
          signal.objectId,
          signal.eserviceId,
          signal.objectType,
          signal.signalType,
        ],
        (rec) => rec.id
      )
    );
  }
  return ids;
}

export const createSignal = (partialSignal?: Partial<Signal>): Signal => ({
  ...createSignalPayload(),
  correlationId: `correlation-id-test-${getRandomInt()}`,

  ...partialSignal,
});

export const createSignalPayload = (
  partialSignal?: Partial<SignalPayload>
): SignalPayload => ({
  signalId: getRandomInt(),
  eserviceId: "eservice-id-test",
  objectId: "object-id-test",
  objectType: "object-type-test",
  signalType: "CREATE",

  ...partialSignal,
});

export const createMultipleSignals = (
  howMany: number,
  partialSignal?: Partial<SignalPayload>
): Signal[] =>
  Array.from({ length: howMany }, () => createSignal(partialSignal));

export const createMultipleOrderedSignals = (
  howMany: number,
  partialSignal?: Partial<SignalPayload>
): Signal[] => {
  const signals: Signal[] = [];
  for (
    // eslint-disable-next-line functional/no-let
    let index = 1;
    index <= howMany;
    index++
  ) {
    // eslint-disable-next-line functional/immutable-data
    signals.push(createSignal({ signalId: index, ...partialSignal }));
  }
  return signals;
};

const getRandomInt = (): number =>
  Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
