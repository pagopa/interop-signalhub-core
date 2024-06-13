import { DB, Logger } from "signalhub-commons";
import { AgreementDto } from "../models/domain/model.js";
import { consumerEserviceRepository } from "../repositories/consumerEservice.repository.js";
import { InteropClientService } from "./interopClient.service.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function consumerServiceBuilder(
  db: DB,
  interopClientService: InteropClientService,
  logger: Logger
) {
  const consumerEserviceRepositoryInstance = consumerEserviceRepository(db);

  return {
    async updateConsumer(agreementDto: AgreementDto): Promise<void> {
      logger.info(
        `Retrieving detail for agreement with id: ${agreementDto.agreementId} and eventId ${agreementDto.eventId}`
      );

      // Get detail from interop agreement
      const consumerEserviceEntity =
        await interopClientService.getConsumerEservice(
          agreementDto.agreementId,
          agreementDto.eventId
        );

      logger.info(
        `Retrieved detail for agreement with id: ${consumerEserviceEntity.agreementId} with state ${consumerEserviceEntity.state}`
      );

      // Check if on signalhub consumer_eservice is present on db
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const entity =
        await consumerEserviceRepositoryInstance.findByEserviceIdAndConsumerIdAndDescriptorId(
          consumerEserviceEntity.eserviceId,
          consumerEserviceEntity.producerId,
          consumerEserviceEntity.descriptorId
        );

      // check and create organization in signalhub ?????

      // Update state of agreement on DB
      // consumerEserviceRepositoryInstance.updateConsumerEservice(
      //   entity.eserviceId,
      //   entity.producerId,
      //   entity.descriptorId,
      //   consumerEserviceEntity.state
      // );
    },
  };
}

export type ConsumerService = ReturnType<typeof consumerServiceBuilder>;
