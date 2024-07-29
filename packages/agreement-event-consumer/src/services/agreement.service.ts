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
      logger.debug(`updating event: ${JSON.stringify(agreement)}`);
      const eventWasProcessed = await agreementRepository.eventWasProcessed(
        agreement.event_stream_id,
        agreement.event_version_id
      );
      logger.debug(`event was already processed: ${eventWasProcessed}`);
      if (eventWasProcessed) {
        return;
      }
      await agreementRepository.update(agreement);
    },
    async insert(agreement: AgreementEntity, logger: Logger): Promise<void> {
      logger.debug(`inserting event: ${JSON.stringify(agreement, null, 2)}`);
      const eventWasProcessed = await agreementRepository.eventWasProcessed(
        agreement.event_stream_id,
        agreement.event_version_id
      );
      logger.debug(`event was already processed: ${eventWasProcessed}`);
      if (eventWasProcessed) {
        return;
      }
      await agreementRepository.insert(agreement);
    },
    async delete(
      agreementId: string,
      streamId: string,
      logger: Logger
    ): Promise<void> {
      // some business logic
      logger.info(`deleting event: ${agreementId}`);
      await agreementRepository.delete(agreementId, streamId);
    },
  };
}

export type AgreementService = ReturnType<typeof agreementServiceBuilder>;
