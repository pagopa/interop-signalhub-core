import { DB, TableName, genericInternalError } from "pagopa-signalhub-commons";
import { config } from "../config/env.js";

export interface IEserviceProduceRepository {
  readonly eventWasProcessed: (
    streamId: string,
    version: number
  ) => Promise<boolean>;
  readonly insert: (
    eServiceId: string,
    producerId: string,
    eventStreamId: string,
    eventVersionId: number
  ) => Promise<void>;
  readonly findProducerIdByEserviceId: (
    eServiceId: string
  ) => Promise<string | null>;
}
export const eServiceProducerRepository = (
  db: DB
): IEserviceProduceRepository => {
  const eServiceProducerTable: TableName = `${config.interopSchema}.eservice_producer`;

  return {
    async eventWasProcessed(
      streamId: string,
      version: number
    ): Promise<boolean> {
      try {
        const response = await db.oneOrNone(
          `select event_stream_id, event_version_id from ${eServiceProducerTable} a where a.event_stream_id = $1 AND a.event_version_id = $2`,
          [streamId, version]
        );
        return response ? true : false;
      } catch (error) {
        throw genericInternalError(`Error eventWasProcessed:" ${error} `);
      }
    },

    async insert(
      eServiceId: string,
      producerId: string,
      eventStreamId: string,
      eventVersionId: number
    ): Promise<void> {
      try {
        await db.none(
          `INSERT INTO ${eServiceProducerTable}(eservice_id, producer_id,event_stream_id,event_version_id) VALUES ($1, $2, $3, $4)`,
          [eServiceId, producerId, eventStreamId, eventVersionId]
        );
      } catch (error) {
        throw genericInternalError(`Error inserting eservice: ${error}`);
      }
    },

    async findProducerIdByEserviceId(
      eServiceId: string
    ): Promise<string | null> {
      try {
        const result = await db.oneOrNone(
          `SELECT producer_id FROM ${eServiceProducerTable} WHERE eservice_id = $1`,
          [eServiceId]
        );

        if (!result.producer_id) {
          return null;
        }

        return result.producer_id;
      } catch (error) {
        throw genericInternalError(`Error findProducerIdByEserviceId ${error}`);
      }
    },
  };
};
