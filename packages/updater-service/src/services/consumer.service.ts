import { DB, Logger } from "signalhub-commons";
import {
  AgreementEventDto,
  ConsumerEserviceEntity,
} from "../models/domain/model.js";
import { consumerEserviceRepository } from "../repositories/consumerEservice.repository.js";
import { InteropClientService } from "./interopClient.service.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function consumerServiceBuilder(
  db: DB,
  interopClientService: InteropClientService,
  logger: Logger
) {
  const consumerEserviceRepositoryInstance = consumerEserviceRepository(db);

  const setInitialConsumerEservice = (
    consumerEservice: ConsumerEserviceEntity
  ): ConsumerEserviceEntity => consumerEservice;

  return {
    async updateConsumer(agreementDto: AgreementEventDto): Promise<void> {
      logger.info(
        `Retrieving detail for agreement with id: ${agreementDto.agreementId} and eventId ${agreementDto.eventId}`
      );

      // Get detail from interop agreement already converted to consumer_eservice entity
      const detailAgreement = await interopClientService.getConsumerEservice(
        agreementDto.agreementId,
        agreementDto.eventId
      );

      logger.info(
        `Retrieved detail for agreement with id: ${detailAgreement.agreementId} with state ${detailAgreement.state}`
      );

      // Check if on signalhub consumer_eservice is present on db
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, functional/no-let
      let entity =
        await consumerEserviceRepositoryInstance.findByEserviceIdAndConsumerIdAndDescriptorId(
          detailAgreement.eserviceId,
          detailAgreement.producerId,
          detailAgreement.descriptorId
        );

      // if entity is not present on db need to create
      if (!entity) {
        entity = setInitialConsumerEservice(detailAgreement);
      } else {
        logger.info("entity is present on db");
        // eslint-disable-next-line functional/immutable-data
        entity.state = detailAgreement.state;
      }

      // if(detailAgreement.state === "ACTIVE")

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
