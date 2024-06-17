import { DB, Logger } from "signalhub-commons";
import {
  AgreementEventDto,
  ConsumerEserviceEntity,
} from "../models/domain/model.js";
import { consumerEserviceRepository } from "../repositories/consumerEservice.repository.js";
import { InteropClientService } from "./interopClient.service.js";
import { ProducerService } from "./producerService.service.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function consumerServiceBuilder(
  db: DB,
  interopClientService: InteropClientService,
  producerService: ProducerService,
  logger: Logger
) {
  const consumerEserviceRepositoryInstance = consumerEserviceRepository(db);

  const setInitialConsumerEservice = (
    consumerEservice: ConsumerEserviceEntity
  ): ConsumerEserviceEntity => consumerEservice;

  return {
    async updateConsumer(
      agreementEventDto: AgreementEventDto
    ): Promise<number> {
      logger.info(
        `Retrieving detail for agreement with id: ${agreementEventDto.agreementId} and eventId ${agreementEventDto.eventId}`
      );

      // Get detail from interop agreement already converted to consumer_eservice entity
      const detailAgreement = await interopClientService.getConsumerEservice(
        agreementEventDto.agreementId,
        agreementEventDto.eventId
      );

      if (detailAgreement) {
        logger.info(
          `Retrieved detail for agreement with id: ${detailAgreement.agreementId} with state ${detailAgreement.state}`
        );

        /** Check on DB if eservice is already present */
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, functional/no-let
        let entity =
          await consumerEserviceRepositoryInstance.findByEserviceIdAndConsumerIdAndDescriptorId(
            detailAgreement.eserviceId,
            detailAgreement.producerId,
            detailAgreement.descriptorId
          );

        if (!entity) {
          entity = setInitialConsumerEservice(detailAgreement);

          await consumerEserviceRepositoryInstance.insertConsumerEservice(
            entity.agreementId,
            entity.eserviceId,
            entity.producerId,
            entity.descriptorId,
            entity.eventId,
            detailAgreement.state
          );
        } else {
          logger.info(
            ` agreement with id: ${detailAgreement.agreementId} is already available on DB`
          );
          await consumerEserviceRepositoryInstance.updateConsumerEservice(
            entity.eserviceId,
            entity.producerId,
            entity.descriptorId,
            detailAgreement.state
          );
        }

        if (detailAgreement.state === "ACTIVE") {
          await producerService.checkAndUpdate(
            detailAgreement.eserviceId,
            detailAgreement.producerId,
            detailAgreement.descriptorId,
            detailAgreement.eventId
          );
        }
      }

      return agreementEventDto.eventId;
    },
  };
}

export type ConsumerService = ReturnType<typeof consumerServiceBuilder>;
