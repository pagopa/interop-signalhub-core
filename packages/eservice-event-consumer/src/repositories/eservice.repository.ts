/* eslint-disable functional/no-method-signature */
import {
  DB,
  genericInternalError,
  toProducerEservice,
  ProducerService,
  getCurrentDate,
} from "pagopa-signalhub-commons";
import {
  EserviceDescriptorEntity,
  EserviceEntity,
} from "../models/domain/model.js";

export interface IEserviceRepository {
  eventWasProcessed(streamId: string, version: number): Promise<boolean>;
  findByEserviceIdAndProducerIdAndDescriptorId(
    eserviceId: string,
    producerId: string,
    descriptorId: string
  ): Promise<ProducerService | null>;

  insertEservice(eService: EserviceEntity): Promise<void>;

  updateDescriptor(eServiceDesriptor: EserviceDescriptorEntity): Promise<void>;
}
export const eServiceRepository = (db: DB): IEserviceRepository => ({
  async eventWasProcessed(streamId, consumerId): Promise<boolean> {
    try {
      const response = await db.oneOrNone(
        "select event_stream_id, event_version_id from dev_interop.eservice a where a.event_stream_id = $1 AND a.event_version_id = $2",
        [streamId, consumerId]
      );
      return response ? true : false;
    } catch (error) {
      throw genericInternalError(`Error eventWasProcessed:" ${error} `);
    }
  },

  async findByEserviceIdAndProducerIdAndDescriptorId(
    eserviceId: string,
    producerId: string,
    descriptorId: string
  ): Promise<ProducerService | null> {
    try {
      const result = await db.oneOrNone(
        "SELECT * FROM DEV_INTEROP.eservice e WHERE e.eservice_id = $1 AND e.producer_id = $2 AND e.descriptor_id = $3",
        [eserviceId, producerId, descriptorId]
      );

      if (!result) {
        return null;
      }

      return toProducerEservice(result);
    } catch (error) {
      throw genericInternalError(
        `Error findByEserviceIdAndProducerIdAndDescriptorId:" ${error} `
      );
    }
  },

  async insertEservice(eService: EserviceEntity): Promise<void> {
    try {
      const {
        eservice_id,
        producer_id,
        descriptor_id,
        event_version_id,
        state,
        event_stream_id,
        eservice_version,
      } = eService;
      await db.oneOrNone(
        "INSERT INTO DEV_INTEROP.eservice(eservice_id, producer_id, descriptor_id,state,eservice_version,event_stream_id, event_version_id) VALUES($1, $2, $3, $4, $5, $6, $7)",
        [
          eservice_id,
          producer_id,
          descriptor_id,
          state,
          eservice_version,
          event_stream_id,
          event_version_id,
        ]
      );
    } catch (error) {
      throw genericInternalError(`Error insertEservice:" ${error} `);
    }
  },

  async updateDescriptor(
    eServiceDescriptor: EserviceDescriptorEntity
  ): Promise<void> {
    try {
      const {
        descriptor_id,
        eservice_id,
        state,
        eservice_version,
        event_version_id,
        event_stream_id,
      } = eServiceDescriptor;
      const tmstLastEdit = getCurrentDate();
      await db.oneOrNone(
        "UPDATE DEV_INTEROP.eservice SET descriptor_id=$2 , state = $3 , tmst_last_edit= $4, eservice_version=$5, event_stream_id=$6 , event_version_id=$7 WHERE eservice.eservice_id = $1 AND (eservice.eservice_version < $5 OR eservice.eservice_version IS NULL)",
        [
          eservice_id,
          descriptor_id,
          state,
          tmstLastEdit,
          eservice_version,
          event_stream_id,
          event_version_id,
        ]
      );
    } catch (error) {
      throw genericInternalError(`Error updateEserviceDescriptor:" ${error} `);
    }
  },
});
