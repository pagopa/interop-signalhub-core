/* eslint-disable functional/no-method-signature */
import {
  DB,
  ProducerService,
  genericInternalError,
  toProducerEservice,
} from "pagopa-signalhub-commons";
import { getCurrentDate } from "../utils.js";

export interface IProducerServiceRepository {
  findByEserviceIdAndProducerIdAndDescriptorId(
    eserviceId: string,
    producerId: string,
    descriptorId: string
  ): Promise<ProducerService | null>;

  insertEservice(
    eserviceId: string,
    producerId: string,
    descriptorId: string,
    eventId: number,
    state: string
  ): Promise<ProducerService>;

  updateEservice(
    eServiceId: string,
    descriptorId: string,
    eventId: number,
    state: string
  ): Promise<ProducerService>;
}
export const producerEserviceRepository = (
  db: DB
): IProducerServiceRepository => ({
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

  async insertEservice(
    eserviceId: string,
    producerId: string,
    descriptorId: string,
    eventId: number,
    state: string
  ): Promise<ProducerService> {
    try {
      const response = await db.oneOrNone(
        "INSERT INTO DEV_INTEROP.eservice(eservice_id, producer_id, descriptor_id, event_id,state) VALUES($1, $2, $3, $4, $5) RETURNING *",
        [eserviceId, producerId, descriptorId, eventId, state]
      );

      return toProducerEservice(response);
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
