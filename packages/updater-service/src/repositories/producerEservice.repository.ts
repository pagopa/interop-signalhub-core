/* eslint-disable functional/no-method-signature */
import {
  DB,
  ProducerEserviceDto,
  genericInternalError,
  toProducerEserviceDto,
} from "signalhub-commons";

export interface IProducerServiceRepository {
  findByEserviceIdAndProducerIdAndDescriptorId(
    eserviceId: string,
    producerId: string,
    descriptorId: string
  ): Promise<ProducerEserviceDto | null>;

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
  ): Promise<ProducerEserviceDto | null> {
    try {
      const result = await db.oneOrNone(
        "SELECT * FROM eservice WHERE eservice.eservice_id = $1 AND eservice.producer_id = $2 AND eservice.descriptor_id = $3",
        [eserviceId, producerId, descriptorId]
      );

      if (!result) {
        return null;
      }

      return toProducerEserviceDto(result);
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
        "INSERT INTO eservice(eservice_id, producer_id, descriptor_id, event_id,state) VALUES($1, $2, $3, $4, $5) RETURNING eservice_id",
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
        "UPDATE eservice SET state = $1, event_id = $2 WHERE eservice.eservice_id = $3 AND eservice.descriptor_id = $4",
        [state, eventId, eserviceId, descriptorId]
      )) as number;
    } catch (error) {
      throw genericInternalError(`Error updateEservice:" ${error} `);
    }
  },
});
