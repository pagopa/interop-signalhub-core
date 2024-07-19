import { Agreement, Logger } from "pagopa-signalhub-commons";
import { AgreementEventDto } from "../models/domain/model.js";
import { IAgreementRepository } from "../repositories/agreement.repository.js";
import { InteropClientService } from "./interopClient.service.js";
import { ProducerService } from "./producerService.service.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function agreementServiceBuilder(
  agreementRepository: IAgreementRepository,
  interopClientService: InteropClientService,
  producerService: ProducerService,
  logger: Logger
) {
  const setInitialAgreement = (agreement: Agreement): Agreement => agreement;

  return {
    async updateAgreement(
      agreementEventDto: AgreementEventDto
    ): Promise<number> {
      logger.info(
        `Retrieving detail for agreement with id: ${agreementEventDto.agreementId} and eventId ${agreementEventDto.eventId}`
      );

      // Get detail from interop agreement already converted to Agreement entity
      const detailAgreement = await interopClientService.getDetailAgreement(
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
          await agreementRepository.findByEserviceIdAndConsumerIdAndDescriptorId(
            detailAgreement.eserviceId,
            detailAgreement.consumerId,
            detailAgreement.descriptorId
          );
        // if entity is not present, it means that the agreement is not present on DB and we need to insert it
        if (!entity) {
          entity = setInitialAgreement(detailAgreement);

          await agreementRepository.insertAgreement(
            entity.agreementId,
            entity.eserviceId,
            entity.consumerId,
            entity.descriptorId,
            entity.eventId,
            detailAgreement.state
          );
        } else {
          logger.info(
            ` agreement with id: ${detailAgreement.agreementId} is already available on DB`
          );
          await agreementRepository.updateAgreement(
            entity.eserviceId,
            entity.consumerId,
            entity.descriptorId,
            detailAgreement.state
          );
        }

        if (detailAgreement.state === "ACTIVE") {
          await producerService.checkEserviceTable(
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

export type AgreementService = ReturnType<typeof agreementServiceBuilder>;
