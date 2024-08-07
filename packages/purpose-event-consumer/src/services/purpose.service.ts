/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from "pagopa-signalhub-commons";
import { PurposeEntity } from "../models/domain/model.js";
import { IPurposeRepository } from "../repositories/index.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function purposeServiceBuilder(purposeRepository: IPurposeRepository) {
  return {
    async upsert(purpose: PurposeEntity, logger: Logger): Promise<void> {
      const eventWasProcessed = await purposeRepository.eventWasProcessed(
        purpose.eventStreamId,
        purpose.eventVersionId
      );
      if (eventWasProcessed) {
        logger.debug(`Skip event (idempotence)`);
        return;
      }
      logger.debug(
        `Saving event: (stato: ${purpose.purposeState}, e-service: ${purpose.eserviceId}, consumerId: ${purpose.consumerId})`
      );
      await purposeRepository.upsert(purpose);
    },
    async delete(
      purposeId: string,
      streamId: string,
      logger: Logger
    ): Promise<void> {
      logger.info(`Deleting event: ${purposeId}`);
      await purposeRepository.delete(purposeId, streamId);
    },
  };
}

export type PurposeService = ReturnType<typeof purposeServiceBuilder>;
