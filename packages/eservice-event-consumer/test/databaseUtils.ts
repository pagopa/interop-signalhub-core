import { postgresDB } from "./utils.js";

export const insertEserviceIdAndProducerId = async (
  eServiceId: string,
  producerId: string
) => {
  await postgresDB.none(
    "INSERT INTO dev_interop.eservice_producer(eservice_id, producer_id) VALUES ($1, $2)",
    [eServiceId, producerId]
  );
};
export const findProducerIdByEserviceId = async (
  eServiceId: string
): Promise<{
  producerId: string;
} | null> => {
  const result = await postgresDB.oneOrNone(
    "SELECT producer_id FROM dev_interop.eservice_producer e WHERE e.eservice_id  = $1",
    [eServiceId]
  );

  if (!result) {
    return null;
  }

  return {
    producerId: result.producer_id,
  };
};

export const findByEserviceIdAndProducerIdAndDescriptorId = async (
  eServiceId: string,
  descriptorId: string,
  producerId: string
) => {
  const result = await postgresDB.oneOrNone(
    "SELECT * FROM dev_interop.eservice e WHERE e.eservice_id = $1 AND e.descriptor_id = $2 AND e.producer_id = $3",
    [eServiceId, descriptorId, producerId]
  );

  if (!result) {
    return null;
  }

  return result;
};

export const insertEservice = async (
  eServiceId: string,
  descriptorId: string,
  producerId: string,
  state: string,
  eventStreamId: string,
  eventVersionId: number
) => {
  await postgresDB.none(
    "INSERT INTO dev_interop.eservice(eservice_id, descriptor_id, producer_id, state, event_stream_id, event_version_id) VALUES ($1, $2, $3, $4, $5, $6)",
    [eServiceId, descriptorId, producerId, state, eventStreamId, eventVersionId]
  );
};
