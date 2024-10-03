import { DB, TableName, genericInternalError } from "pagopa-signalhub-commons";
import { PurposeEntity } from "../models/domain/model.js";
import { config } from "../config/env.js";

export interface IPurposeRepository {
  readonly eventWasProcessed: (
    streamId: string,
    version: number
  ) => Promise<boolean>;
  readonly insert: (purpose: PurposeEntity) => Promise<void>;
  readonly update: (purpose: PurposeEntity) => Promise<void>;
  readonly upsert: (purpose: PurposeEntity) => Promise<void>;
  readonly delete: (purposeId: string, streamId: string) => Promise<void>;
}

export const purposeRepository = (db: DB): IPurposeRepository => {
  const purposeTable: TableName = `${config.interopSchema}.purpose`;

  return {
    async eventWasProcessed(streamId, versionId): Promise<boolean> {
      try {
        const response = await db.oneOrNone(
          `select event_stream_id, event_version_id from ${purposeTable} p where p.event_stream_id = $1 AND p.event_version_id >= $2`,
          [streamId, versionId]
        );
        return response ? true : false;
      } catch (error) {
        throw genericInternalError(`Error eventWasProcessed:" ${error} `);
      }
    },

    async insert(purpose: PurposeEntity): Promise<void> {
      try {
        const {
          purposeId,
          purposeVersionId,
          purposeState,
          eserviceId,
          consumerId,
          eventStreamId,
          eventVersionId,
        } = purpose;
        await db.oneOrNone(
          `INSERT INTO ${purposeTable}(purpose_id, purpose_version_id, purpose_state, eservice_id, consumer_id, event_stream_id, event_version_id) VALUES($1, $2, $3, $4, $5, $6, $7)`,
          [
            purposeId,
            purposeVersionId,
            purposeState,
            eserviceId,
            consumerId,
            eventStreamId,
            eventVersionId,
          ]
        );
      } catch (error) {
        throw genericInternalError(`Error insertPurpose:" ${error} `);
      }
    },

    async upsert(purpose: PurposeEntity): Promise<void> {
      try {
        const tmstLastEdit = getCurrentDate();
        const {
          purposeId,
          purposeVersionId,
          eserviceId,
          consumerId,
          purposeState,
          eventStreamId,
          eventVersionId,
        } = purpose;
        await db.oneOrNone(
          `INSERT INTO ${purposeTable}(purpose_id, purpose_version_id, purpose_state, eservice_id, consumer_id, event_stream_id, event_version_id) 
          VALUES($1, $2, $3, $4, $5, $6, $7) 
          ON CONFLICT (purpose_id) 
          DO UPDATE SET 
          purpose_version_id = EXCLUDED.purpose_version_id,
          purpose_state = EXCLUDED.purpose_state,
          event_stream_id = EXCLUDED.event_stream_id,
          event_version_id = EXCLUDED.event_version_id,
          tmst_last_edit= EXCLUDED.tmst_last_edit`,
          [
            purposeId,
            purposeVersionId,
            purposeState,
            eserviceId,
            consumerId,
            eventStreamId,
            eventVersionId,
            tmstLastEdit,
          ]
        );
      } catch (error) {
        throw genericInternalError(`Error updatePurpose:" ${error} `);
      }
    },
    async update(purpose: PurposeEntity): Promise<void> {
      try {
        const tmstLastEdit = getCurrentDate();
        const {
          purposeId,
          purposeVersionId,
          eserviceId,
          consumerId,
          purposeState,
          eventStreamId,
          eventVersionId,
        } = purpose;
        await db.none(
          `update ${purposeTable} set purpose_id = $1, purpose_version_id = $2, eservice_id = $3, consumer_id = $4, purpose_state = $5, event_stream_id = $6, event_version_id =$7, tmst_last_edit = $8  where purpose_id = $1 and purpose_version_id = $2 and event_stream_id = $6`,
          [
            purposeId,
            purposeVersionId,
            eserviceId,
            consumerId,
            purposeState,
            eventStreamId,
            eventVersionId,
            tmstLastEdit,
          ]
        );
      } catch (error) {
        throw genericInternalError(`Error updatePurpose:" ${error} `);
      }
    },
    async delete(purposeId: string, streamId: string): Promise<void> {
      await db.none(
        `delete from ${purposeTable} where purpose_id = $1 and event_stream_id = $2`,
        [purposeId, streamId]
      );
    },
  };
};

function getCurrentDate(): string {
  return new Date().toISOString();
}
