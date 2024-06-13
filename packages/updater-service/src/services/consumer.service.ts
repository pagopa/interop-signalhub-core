import { DB, Logger } from "signalhub-commons";
import { InteropClientService } from "./interopClient.service.js";
import { AgreementDto } from "../models/domain/model.js";
import { consumerEserviceRepository } from "../repositories/consumerEservice.repository.js";

export function consumerServiceBuilder(
  db: DB,
  interopClientService: InteropClientService,
  logger: Logger
) {
  const consumerEserviceRepositoryInstance = consumerEserviceRepository(db);

  return {
    async updateConsumer(agreementDto: AgreementDto) {
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
      const entity =
        await consumerEserviceRepositoryInstance.findByEserviceIdAndConsumerIdAndDescriptorId(
          consumerEserviceEntity.eserviceId,
          consumerEserviceEntity.producerId,
          consumerEserviceEntity.descriptorId
        );

      // check and create organization in signalhub ?????

      // Update state of agreement on DB
      consumerEserviceRepositoryInstance.updateConsumerEservice(
        entity.eserviceId,
        entity.producerId,
        entity.descriptorId,
        consumerEserviceEntity.state
      );
    },
  };
}

export type ConsumerService = ReturnType<typeof consumerServiceBuilder>;
