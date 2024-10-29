import {
  DB,
  ProducerService,
  TableName,
  genericInternalError,
  getCurrentDate,
  toProducerEservice,
} from "pagopa-signalhub-commons";

import { config } from "../config/env.js";
import { EserviceDescriptorEntity } from "../models/domain/model.js";

export interface IEserviceRepository {
  readonly delete: (eserviceId: string) => Promise<void>;
  readonly deleteDescriptor: (
    eserviceId: string,
    descriptorId: string,
  ) => Promise<void>;

  readonly eventWasProcessed: (
    descriptorId: string,
    streamId: string,
    version: number,
  ) => Promise<boolean>;

  readonly findByEserviceIdAndProducerIdAndDescriptorId: (
    eserviceId: string,
    producerId: string,
    descriptorId: string,
  ) => Promise<ProducerService | null>;

  readonly upsertDescriptor: (
    eServiceId: string,
    producerId: string,
    eServiceDescriptor: EserviceDescriptorEntity,
    eventStreamId: string,
    eventVersionId: number,
    isSignalHubEnabled?: boolean,
  ) => Promise<void>;
}
export const eServiceRepository = (db: DB): IEserviceRepository => {
  const eServiceTable: TableName = `${config.interopSchema}.eservice`;

  return {
    async delete(eserviceId: string): Promise<void> {
      try {
        await db.oneOrNone(
          `DELETE FROM ${eServiceTable} WHERE eservice_id = $1`,
          [eserviceId],
        );
      } catch (error) {
        throw genericInternalError(`Error deleteEservice:" ${error} `);
      }
    },

    async deleteDescriptor(
      eserviceId: string,
      descriptorId: string,
    ): Promise<void> {
      try {
        await db.oneOrNone(
          `DELETE FROM ${eServiceTable} WHERE eservice_id = $1 AND descriptor_id = $2`,
          [eserviceId, descriptorId],
        );
      } catch (error) {
        throw genericInternalError(
          `Error deleteEserviceDescriptor:" ${error} `,
        );
      }
    },

    async eventWasProcessed(
      descriptorId,
      streamId,
      versionId,
    ): Promise<boolean> {
      try {
        const response = await db.oneOrNone(
          `select event_stream_id, event_version_id from ${eServiceTable} a where a.event_stream_id = $1 AND a.event_version_id >= $2 AND a.descriptor_id = $3`,
          [streamId, versionId, descriptorId],
        );

        return response ? true : false;
      } catch (error) {
        throw genericInternalError(`Error eventWasProcessed:" ${error} `);
      }
    },

    async findByEserviceIdAndProducerIdAndDescriptorId(
      eserviceId: string,
      producerId: string,
      descriptorId: string,
    ): Promise<ProducerService | null> {
      try {
        const result = await db.oneOrNone(
          `SELECT * FROM ${eServiceTable} e WHERE e.eservice_id = $1 AND e.producer_id = $2 AND e.descriptor_id = $3`,
          [eserviceId, producerId, descriptorId],
        );

        if (!result) {
          return null;
        }

        return toProducerEservice(result);
      } catch (error) {
        throw genericInternalError(
          `Error findByEserviceIdAndProducerIdAndDescriptorId:" ${error} `,
        );
      }
    },

    async upsertDescriptor(
      eServiceId: string,
      producerId: string,
      eServiceDescriptor: EserviceDescriptorEntity,
      eventStreamId: string,
      eventVersionId: number,
      isSignalHubEnabled: boolean | undefined,
    ): Promise<void> {
      try {
        const tmstLastEdit = getCurrentDate();
        const { descriptor_id, state } = eServiceDescriptor;

        await db.oneOrNone(
          `INSERT INTO ${eServiceTable}(eservice_id, producer_id, descriptor_id, state, event_stream_id, event_version_id, enabled_signal_hub, tmst_last_edit)
             VALUES($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (eservice_id, descriptor_id)
             DO UPDATE SET
                producer_id = EXCLUDED.producer_id,
                state = EXCLUDED.state,
                event_stream_id = EXCLUDED.event_stream_id,
                event_version_id = EXCLUDED.event_version_id,
                enabled_signal_hub = EXCLUDED.enabled_signal_hub,
                tmst_last_edit= EXCLUDED.tmst_last_edit
                `,

          [
            eServiceId,
            producerId,
            descriptor_id,
            state,
            eventStreamId,
            eventVersionId,
            isSignalHubEnabled,
            tmstLastEdit,
          ],
        );
      } catch (error) {
        throw genericInternalError(`Error insertEservice:" ${error} `);
      }
    },
  };
};
