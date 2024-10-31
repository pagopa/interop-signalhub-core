import { Logger } from "pagopa-signalhub-commons";

import { AgreementEntity } from "../models/domain/model.js";
import { IAgreementRepository } from "../repositories/agreement.repository.js";

export interface IAgreementService {
  readonly delete: (
    agreementId: string,
    streamId: string,
    logger: Logger
  ) => Promise<void>;
  readonly insert: (
    agreement: AgreementEntity,
    logger: Logger
  ) => Promise<void>;
  readonly update: (
    agreement: AgreementEntity,
    logger: Logger
  ) => Promise<void>;
}
export function agreementServiceBuilder(
  agreementRepository: IAgreementRepository
): IAgreementService {
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
        `Saving event (update) agreementId: ${agreement.agreement_id}, state: ${agreement.state}, e-service: ${agreement.eservice_id}, consumerId: ${agreement.consumer_id}`
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
        `Saving event (insert) agreementId: ${agreement.agreement_id}, state: ${agreement.state}, e-service: ${agreement.eservice_id}, consumerId: ${agreement.consumer_id}`
      );
      await agreementRepository.insert(agreement);
    },
    async delete(
      agreementId: string,
      streamId: string,
      logger: Logger
    ): Promise<void> {
      logger.info(`Deleting agreement with agreementId: ${agreementId}`);
      await agreementRepository.delete(agreementId, streamId);
    }
  };
}

export type AgreementService = ReturnType<typeof agreementServiceBuilder>;
