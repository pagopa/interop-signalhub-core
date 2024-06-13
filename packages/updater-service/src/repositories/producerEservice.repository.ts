/* eslint-disable functional/no-method-signature */
import { DB, genericInternalError } from "signalhub-commons";
import { ProducerEserviceEntity } from "../models/domain/model.js";

export interface IProducerServiceRepository {
  findByEserviceIdAndProducerIdAndDescriptorId(
    eserviceId: string,
    producerId: string,
    descriptorId: string
  ): Promise<ProducerEserviceEntity>;

  insertEservice(
    eserviceId: string,
    producerId: string,
    descriptorId: string,
    eventId: number
  ): Promise<number | null>;
}
export const producerEserviceRepository = (
  db: DB
): IProducerServiceRepository => ({
  async findByEserviceIdAndProducerIdAndDescriptorId(
    eserviceId: string,
    producerId: string,
    descriptorId: string
  ): Promise<ProducerEserviceEntity> {
    try {
      return (await db.oneOrNone(
        "SELECT eservice FROM  eservice WHERE eservice.eservice_id = $1 AND eservice.producer_id = $2 AND eservice.descriptor_id = $3",
        [eserviceId, producerId, descriptorId]
      )) as ProducerEserviceEntity;
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
    eventId: number
  ): Promise<number | null> {
    try {
      return (await db.oneOrNone(
        "INSERT INTO eservice(eservice_id, producer_id, descriptor_id, event_id) VALUES($1, $2, $3, $4) RETURNING eservice_id",
        [eserviceId, producerId, descriptorId, eventId]
      )) as number;
    } catch (error) {
      throw genericInternalError(`Error insertEservice:" ${error} `);
    }
  },
});
