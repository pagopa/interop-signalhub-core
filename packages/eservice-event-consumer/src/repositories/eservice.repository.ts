/* eslint-disable functional/no-method-signature */
import {
  DB,
  genericInternalError,
  toProducerEservice,
  ProducerService,
  getCurrentDate,
} from "pagopa-signalhub-commons";
import { EserviceEntity } from "../models/domain/model.js";

export interface IEserviceRepository {
  eventWasProcessed(streamId: string, version: number): Promise<boolean>;
  findByEserviceIdAndProducerIdAndDescriptorId(
    eserviceId: string,
    producerId: string,
    descriptorId: string
  ): Promise<ProducerService | null>;

  insertEservice(eService: EserviceEntity): Promise<void>;

  updateEservice(
    eServiceId: string,
    descriptorId: string,
    eventId: number,
    state: string
  ): Promise<ProducerService>;
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
        eservice_version_id,
      } = eService;
      await db.oneOrNone(
        "INSERT INTO DEV_INTEROP.eservice(eservice_id, producer_id, descriptor_id,state,eservice_version_id,event_stream_id, event_version_id) VALUES($1, $2, $3, $4, $5,$6,$7)",
        [
          eservice_id,
          producer_id,
          descriptor_id,
          state,
          eservice_version_id,
          event_stream_id,
          event_version_id,
        ]
      );
    } catch (error) {
      throw genericInternalError(`Error insertEservice:" ${error} `);
    }
  },

  async updateEservice(
    eserviceId: string,
    descriptorId: string,
    eventId: number,
    state: string
  ): Promise<ProducerService> {
    try {
      const tmstLastEdit = getCurrentDate();
      const response = await db.oneOrNone(
        "UPDATE DEV_INTEROP.eservice SET state = $1, event_id = $2 , tmst_last_edit= $3  WHERE eservice.eservice_id = $4 AND eservice.descriptor_id = $5 RETURNING *",
        [state, eventId, tmstLastEdit, eserviceId, descriptorId]
      );

      return toProducerEservice(response);
    } catch (error) {
      throw genericInternalError(`Error updateEservice:" ${error} `);
    }
  },
});
