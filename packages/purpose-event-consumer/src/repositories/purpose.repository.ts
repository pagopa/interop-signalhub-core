import { DB, TableName, genericInternalError } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";
import { PurposeEntity } from "../models/domain/model.js";

export interface IPurposeRepository {
  readonly delete: (purposeId: string, streamId: string) => Promise<void>;
  readonly eventWasProcessed: (
    streamId: string,
    version: number
  ) => Promise<boolean>;
  readonly upsert: (purpose: PurposeEntity) => Promise<void>;
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
          delegationId
        } = purpose;
        await db.oneOrNone(
          `INSERT INTO ${purposeTable}(purpose_id, purpose_version_id, purpose_state, eservice_id, consumer_id, event_stream_id, event_version_id, delegation_id) 
          VALUES($1, $2, $3, $4, $5, $6, $7,$8) 
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
            delegationId
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
    }
  };
};

function getCurrentDate(): string {
  return new Date().toISOString();
}
