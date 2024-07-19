import {
  ConsumerEserviceEntity,
  ProducerEserviceEntity,
} from "pagopa-signalhub-commons";
import { postgresDB } from "../utils";

export async function getConsumerEserviceTableRows(): Promise<
  ConsumerEserviceEntity[]
> {
  return await postgresDB.manyOrNone("SELECT * FROM dev_interop.agreement");
}

export async function getEserviceTableRows(): Promise<
  ProducerEserviceEntity[]
> {
  return await postgresDB.manyOrNone("SELECT * FROM DEV_INTEROP.eservice");
}

export async function getEventIdFromTracingBatch(): Promise<number> {
  const result = await postgresDB.oneOrNone(
    "SELECT last_event_id FROM DEV_INTEROP.TRACING_BATCH"
  );

  return result.last_event_id;
}
