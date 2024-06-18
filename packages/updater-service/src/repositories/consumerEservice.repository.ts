/* eslint-disable functional/no-method-signature */
import {
  ConsumerEserviceDto,
  DB,
  toConsumerEserviceDto,
} from "signalhub-commons";

export interface IConsumerEserviceRepository {
  findByEserviceIdAndConsumerIdAndDescriptorId(
    eserviceId: string,
    consumerId: string,
    descriptorId: string
  ): Promise<ConsumerEserviceDto | null>;

  insertConsumerEservice(
    agreementId: string,
    eserviceId: string,
    consumerId: string,
    descriptorId: string,
    eventId: number,
    state: string
  ): Promise<number | null>;

  updateConsumerEservice(
    eserviceId: string,
    consumerId: string,
    descriptorId: string,
    state: string
  ): Promise<number | null>;
}

export const consumerEserviceRepository = (
  db: DB
): IConsumerEserviceRepository => ({
  async findByEserviceIdAndConsumerIdAndDescriptorId(
    eserviceId,
    consumerId,
    descriptorId
  ): Promise<ConsumerEserviceDto | null> {
    const response = await db.oneOrNone(
      "select consumer from CONSUMER_ESERVICE consumer where consumer.eservice_id = $1 AND consumer.consumer_id = $2  AND consumer.descriptor_id = $3",
      [eserviceId, consumerId, descriptorId]
    );

    return toConsumerEserviceDto(response);
  },

  // eslint-disable-next-line max-params
  async insertConsumerEservice(
    agreementId: string,
    eserviceId: string,
    consumerId: string,
    descriptorId: string,
    eventId: number,
    state: string
  ): Promise<number | null> {
    return await db.oneOrNone(
      "INSERT INTO CONSUMER_ESERVICE(agreement_id,eservice_id, consumer_id, descriptor_id, event_id,state) VALUES($1, $2, $3, $4, $5,$6) RETURNING eservice_id",
      [agreementId, eserviceId, consumerId, descriptorId, eventId, state]
    );
  },

  async updateConsumerEservice(
    eserviceId: string,
    consumerId: string,
    descriptorId: string,
    state: string
  ): Promise<number | null> {
    return await db.oneOrNone(
      "update CONSUMER_ESERVICE set state = $1 where eservice_id = $2 AND consumer_id = $3  AND descriptor_id = $4",
      [state, eserviceId, consumerId, descriptorId]
    );
  },
});
