/* eslint-disable functional/no-method-signature */
import { DB, genericInternalError } from "signalhub-commons";
import { ProducerEserviceEntity } from "../models/domain/model.js";
import { toProducerEserviceEntity } from "../models/domain/toProducerEserviceEntity.js";

export interface IProducerServiceRepository {
  findByEserviceIdAndProducerIdAndDescriptorId(
    eserviceId: string,
    producerId: string,
    descriptorId: string
  ): Promise<ProducerEserviceEntity | null>;

  insertEservice(
    eserviceId: string,
    producerId: string,
    descriptorId: string,
    eventId: number,
    state: string
  ): Promise<number | null>;

  updateEservice(
    eServiceId: string,
    descriptorId: string,
    eventId: number,
    state: string
  ): Promise<number | null>;
}
export const producerEserviceRepository = (
  db: DB
): IProducerServiceRepository => ({
  async findByEserviceIdAndProducerIdAndDescriptorId(
    eserviceId: string,
    producerId: string,
    descriptorId: string
  ): Promise<ProducerEserviceEntity | null> {
    try {
      const result = await db.oneOrNone(
        "SELECT * FROM DEV_INTEROP.eservice e WHERE e.eservice_id = $1 AND e.producer_id = $2 AND e.descriptor_id = $3",
        [eserviceId, producerId, descriptorId]
      );

      if (!result) {
        return null;
      }

      return toProducerEserviceEntity(result);
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
  ): Promise<number | null> {
    try {
      return (await db.oneOrNone(
        "INSERT INTO DEV_INTEROP.eservice(eservice_id, producer_id, descriptor_id, event_id,state) VALUES($1, $2, $3, $4, $5) RETURNING eservice_id",
        [eserviceId, producerId, descriptorId, eventId, state]
      )) as number;
    } catch (error) {
      throw genericInternalError(`Error insertEservice:" ${error} `);
    }
  },

  async updateEservice(
    eserviceId: string,
    descriptorId: string,
    eventId: number,
    state: string
  ): Promise<number | null> {
    try {
      return (await db.oneOrNone(
        "UPDATE DEV_INTEROP.eservice SET state = $1, event_id = $2 WHERE eservice.eservice_id = $3 AND eservice.descriptor_id = $4",
        [state, eventId, eserviceId, descriptorId]
      )) as number;
    } catch (error) {
      throw genericInternalError(`Error updateEservice:" ${error} `);
    }
  },
});