/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from "pagopa-signalhub-commons";
import { IAgreementRepository } from "../repositories/agreement.repository.js";
import { AgreementEntity } from "../models/domain/model.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function agreementServiceBuilder(
  agreementRepository: IAgreementRepository
) {
  return {
    async update(agreement: AgreementEntity, logger: Logger): Promise<void> {
      const eventWasProcessed = await agreementRepository.eventWasProcessed(
        agreement.event_stream_id,
        agreement.event_version_id
      );
      if (eventWasProcessed) {
        logger.info(`Skip event (idempotence)`);
        return;
      }
      logger.info(
        `Saving event (update) state: ${agreement.state}, e-service: ${agreement.eservice_id}, consumerId: ${agreement.consumer_id}`
      );
      await agreementRepository.update(agreement);
    },
    async insert(agreement: AgreementEntity, logger: Logger): Promise<void> {
      const eventWasProcessed = await agreementRepository.eventWasProcessed(
        agreement.event_stream_id,
        agreement.event_version_id
      );
      if (eventWasProcessed) {
        logger.info(`Skip event (idempotence)`);
        return;
      }
      logger.info(
        `Saving event (insert) state: ${agreement.state}, e-service: ${agreement.eservice_id}, consumerId: ${agreement.consumer_id}`
      );
      await agreementRepository.insert(agreement);
    },
    async delete(
      agreementId: string,
      streamId: string,
      logger: Logger
    ): Promise<void> {
      logger.info(`Deleting agreement id: ${agreementId}`);
      await agreementRepository.delete(agreementId, streamId);
    },
  };
}

export type AgreementService = ReturnType<typeof agreementServiceBuilder>;
