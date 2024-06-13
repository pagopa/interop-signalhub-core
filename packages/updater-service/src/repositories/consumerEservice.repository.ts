/* eslint-disable functional/no-method-signature */
import { DB } from "signalhub-commons";
import { ConsumerEserviceEntity } from "../models/domain/model.js";

export interface IConsumerEserviceRepository {
  findByEserviceIdAndConsumerIdAndDescriptorId(
    eserviceId: string,
    consumerId: string,
    descriptorId: string
  ): Promise<ConsumerEserviceEntity | null>;

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
  ): Promise<ConsumerEserviceEntity | null> {
    return await db.oneOrNone(
      "select consumer from CONSUMER_ESERVICE consumer where consumer.eservice_id = $1 AND consumer.consumer_id = $2  AND consumer.descriptor_id = $3",
      [eserviceId, consumerId, descriptorId]
    );
  },

  async updateConsumerEservice(
    eserviceId: string,
    consumerId: string,
    descriptorId: string,
    state: string
  ): Promise<number | null> {
    return await db.none(
      "update CONSUMER_ESERVICE consumer set consumer.state = $1 where consumer.eservice_id = $2 AND consumer.consumer_id = $3  AND consumer.descriptor_id = $4",
      [state, eserviceId, consumerId, descriptorId]
    );
  },
});
