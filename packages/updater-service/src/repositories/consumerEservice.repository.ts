import { DB } from "signalhub-commons";
import { ConsumerEserviceEntity } from "../models/domain/model.js";

export interface IConsumerEserviceRepository {
  findByEserviceIdAndConsumerIdAndDescriptorId(
    eserviceId: string,
    consumerId: string,
    descriptorId: string
  ): Promise<ConsumerEserviceEntity>;

  updateConsumerEservice(
    eserviceId: string,
    consumerId: string,
    descriptorId: string,
    state: string
  ): Promise<void>;
}

export const consumerEserviceRepository = (
  db: DB
): IConsumerEserviceRepository => ({
  async findByEserviceIdAndConsumerIdAndDescriptorId(
    eserviceId,
    consumerId,
    descriptorId
  ) {
    try {
      const consumerEService = await db.oneOrNone(
        "select consumer from CONSUMER_ESERVICE consumer where consumer.eservice_id = $1 AND consumer.consumer_id = $2  AND consumer.descriptor_id = $3",
        [eserviceId, consumerId, descriptorId]
      );

      return consumerEService;
    } catch (error) {
      throw error;
    }
  },

  async updateConsumerEservice(eserviceId, consumerId, descriptorId, state) {
    try {
      await db.oneOrNone(
        "update CONSUMER_ESERVICE set state = $1 where eservice_id = $2 AND consumer_id = $3  AND descriptor_id = $4 returning *",
        [state, eserviceId, consumerId, descriptorId]
      );
    } catch (error) {
      throw error;
    }
  },
});
