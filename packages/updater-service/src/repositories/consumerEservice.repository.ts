/* eslint-disable functional/no-method-signature */
import {
  ConsumerEservice,
  DB,
  genericInternalError,
  toConsumerEservice,
} from "signalhub-commons";

export interface IConsumerEserviceRepository {
  findByEserviceIdAndConsumerIdAndDescriptorId(
    eserviceId: string,
    consumerId: string,
    descriptorId: string
  ): Promise<ConsumerEservice | null>;

  insertConsumerEservice(
    agreementId: string,
    eserviceId: string,
    consumerId: string,
    descriptorId: string,
    eventId: number,
    state: string
  ): Promise<ConsumerEservice>;

  updateConsumerEservice(
    eserviceId: string,
    consumerId: string,
    descriptorId: string,
    state: string
  ): Promise<ConsumerEservice>;
}

export const consumerEserviceRepository = (
  db: DB
): IConsumerEserviceRepository => ({
  async findByEserviceIdAndConsumerIdAndDescriptorId(
    eserviceId,
    consumerId,
    descriptorId
  ): Promise<ConsumerEservice | null> {
    try {
      const response = await db.oneOrNone(
        "select consumer from DEV_INTEROP.CONSUMER_ESERVICE consumer where consumer.eservice_id = $1 AND consumer.consumer_id = $2  AND consumer.descriptor_id = $3",
        [eserviceId, consumerId, descriptorId]
      );

      if (!response) {
        return null;
      }

      return toConsumerEservice(response);
    } catch (error) {
      throw genericInternalError(
        `Error findByEserviceIdAndConsumerIdAndDescriptorId:" ${error} `
      );
    }
  },

  // eslint-disable-next-line max-params
  async insertConsumerEservice(
    agreementId: string,
    eserviceId: string,
    consumerId: string,
    descriptorId: string,
    eventId: number,
    state: string
  ): Promise<ConsumerEservice> {
    try {
      const response = await db.oneOrNone(
        "INSERT INTO DEV_INTEROP.CONSUMER_ESERVICE(agreement_id,eservice_id, consumer_id, descriptor_id, event_id,state) VALUES($1, $2, $3, $4, $5,$6) RETURNING *",
        [agreementId, eserviceId, consumerId, descriptorId, eventId, state]
      );

      return toConsumerEservice(response);
    } catch (error) {
      throw genericInternalError(`Error insertConsumerEservice:" ${error} `);
    }
  },

  async updateConsumerEservice(
    eserviceId: string,
    consumerId: string,
    descriptorId: string,
    state: string
  ): Promise<ConsumerEservice> {
    try {
      const response = await db.oneOrNone(
        "update DEV_INTEROP.CONSUMER_ESERVICE set state = $1 where eservice_id = $2 AND consumer_id = $3  AND descriptor_id = $4 RETURING *",
        [state, eserviceId, consumerId, descriptorId]
      );

      return toConsumerEservice(response);
    } catch (error) {
      throw genericInternalError(`Error updateConsumerEservice:" ${error} `);
    }
  },
});
