import { DB, Logger } from "signalhub-commons";
import { InteropClientService } from "./interopClient.service.js";
import { AgreementDto } from "../models/domain/model.js";

export function consumerServiceBuilder(
  _db: DB,
  interopClientService: InteropClientService,
  logger: Logger
) {
  // const consumerEserviceRepository = consumerEserviceRepository(db);

  return {
    async updateConsumer(agreementDto: AgreementDto) {
      logger.info(
        `Retrieving detail for agreement with id: ${agreementDto.agreementId} and eventId ${agreementDto.eventId}`
      );

      const consumerEserviceEntity =
        await interopClientService.getConsumerEservice(
          agreementDto.agreementId,
          agreementDto.eventId
        );

      logger.info(
        `Retrieved detail for agreement with id: ${consumerEserviceEntity.agreementId} with state ${consumerEserviceEntity.state}`
      );
    },
  };
}

export type ConsumerService = ReturnType<typeof consumerServiceBuilder>;
