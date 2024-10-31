import {
  InteropSchema,
  ProducerEserviceEntity,
  TableName
} from "pagopa-signalhub-commons";

import { postgresDB } from "./utils.js";

export const insertEserviceIdAndProducerId = async (
  eServiceId: string,
  producerId: string,
  schema: InteropSchema
): Promise<void> => {
  const eserviceProducerTable: TableName = `${schema}.eservice_producer`;

  await postgresDB.none(
    `INSERT INTO ${eserviceProducerTable}(eservice_id, producer_id) VALUES ($1, $2)`,
    [eServiceId, producerId]
  );
};
export const findProducerIdByEserviceId = async (
  eServiceId: string,
  schema: InteropSchema
): Promise<{
  producerId: string;
} | null> => {
  const eserviceProducerTable: TableName = `${schema}.eservice_producer`;
  const result = await postgresDB.oneOrNone(
    `SELECT producer_id FROM ${eserviceProducerTable} e WHERE e.eservice_id  = $1`,
    [eServiceId]
  );

  if (!result) {
    return null;
  }

  return {
    producerId: result.producer_id
  };
};

export const findByEserviceIdAndProducerIdAndDescriptorId = async (
  eServiceId: string,
  descriptorId: string,
  producerId: string,
  schema: InteropSchema
): Promise<ProducerEserviceEntity | null> => {
  const eserviceTable = `${schema}.eservice`;
  const result = await postgresDB.oneOrNone(
    `SELECT * FROM ${eserviceTable} e WHERE e.eservice_id = $1 AND e.descriptor_id = $2 AND e.producer_id = $3`,
    [eServiceId, descriptorId, producerId]
  );

  if (!result) {
    return null;
  }

  return result;
};

export const getCountByEserviceId = async (
  eServiceId: string,
  schema: InteropSchema
): Promise<number> => {
  const eserviceTable = `${schema}.eservice`;

  const result = await postgresDB.one(
    `SELECT COUNT(*) FROM ${eserviceTable} WHERE eservice_id = $1`,
    [eServiceId]
  );

  return parseInt(result.count, 10);
};
export const insertEserviceDescriptor = async (
  eServiceId: string,
  descriptorId: string,
  producerId: string,
  state: string,
  eventStreamId: string,
  eventVersionId: number,
  schema: InteropSchema
): Promise<void> => {
  const eserviceTable = `${schema}.eservice`;

  await postgresDB.none(
    `INSERT INTO ${eserviceTable}(eservice_id, descriptor_id, producer_id, state, event_stream_id, event_version_id) VALUES ($1, $2, $3, $4, $5, $6)`,
    [eServiceId, descriptorId, producerId, state, eventStreamId, eventVersionId]
  );
};
