/* eslint-disable functional/no-method-signature */
import { DB, genericInternalError } from "pagopa-signalhub-commons";
import { PurposeEntity } from "../models/domain/model.js";

export interface IPurposeRepository {
  eventWasProcessed(streamId: string, version: number): Promise<boolean>;
  insert(purpose: PurposeEntity): Promise<void>;
  update(purpose: PurposeEntity): Promise<void>;
  delete(purposeId: string, streamId: string): Promise<void>;
}

export const purposeRepository = (db: DB): IPurposeRepository => ({
  async eventWasProcessed(streamId, versionId): Promise<boolean> {
    try {
      const response = await db.oneOrNone(
        "select event_stream_id, event_version_id from dev_interop.purpose p where p.event_stream_id = $1 AND p.event_version_id = $2",
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
        "INSERT INTO dev_interop.purpose(purpose_id, purpose_version_id, purpose_state, eservice_id, consumer_id, event_stream_id, event_version_id) VALUES($1, $2, $3, $4, $5, $6, $7)",
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
        "update dev_interop.purpose set purpose_id = $1, eservice_id = $2, consumer_id = $3, descriptor_id = $4, state = $5, event_stream_id = $6, event_version_id =$7, tmst_last_edit = $8  where purpose_id = $1 and event_stream_id = $6",
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
      "delete from dev_interop.purpose where purpose_id = $1 and event_stream_id = $2",
      [purposeId, streamId]
    );
  },
});

function getCurrentDate(): string {
  return new Date().toISOString();
}
