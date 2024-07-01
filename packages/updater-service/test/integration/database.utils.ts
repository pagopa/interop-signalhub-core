import { postgresDB } from "../utils";

export const getEserviceTableRows = async () => {
  const result = await postgresDB.manyOrNone(
    "SELECT * FROM DEV_INTEROP.eservice"
  );

  return result;
};

export const getEventIdFromTracingBatch = async () => {
  const result = await postgresDB.oneOrNone(
    "SELECT last_event_id FROM DEV_INTEROP.TRACING_BATCH"
  );

  return result.last_event_id;
};
