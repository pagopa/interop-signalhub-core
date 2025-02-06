import { Logger } from "pagopa-signalhub-commons";

import { PurposeEntity } from "../models/domain/model.js";
import { IPurposeRepository } from "../repositories/index.js";

export interface IPurposeService {
  readonly delete: (purpose: PurposeEntity, logger: Logger) => Promise<void>;
  readonly upsert: (purpose: PurposeEntity, logger: Logger) => Promise<void>;
}
export function purposeServiceBuilder(
  purposeRepository: IPurposeRepository
): IPurposeService {
  return {
    async upsert(purpose: PurposeEntity, logger: Logger): Promise<void> {
      const eventWasProcessed = await purposeRepository.eventWasProcessed(
        purpose.eventStreamId,
        purpose.eventVersionId
      );
      if (eventWasProcessed) {
        logger.info(`Skip event (idempotence)`);
        return;
      }
      logger.info(
        `Saving event (upsert) state: ${purpose.purposeState}, e-service: ${purpose.eserviceId}, consumerId: ${purpose.consumerId}`
      );
      await purposeRepository.upsert(purpose);
    },
    async delete(purpose: PurposeEntity, logger: Logger): Promise<void> {
      const { purposeId, eventStreamId } = purpose;
      const eventWasProcessed = await purposeRepository.eventWasProcessed(
        purpose.eventStreamId,
        purpose.eventVersionId
      );
      if (eventWasProcessed) {
        logger.info(`Skip event (idempotence)`);
        return;
      }

      logger.info(`Delete purpose with purposeId: ${purposeId}`);
      await purposeRepository.delete(purposeId, eventStreamId);
    }
  };
}

export type PurposeService = ReturnType<typeof purposeServiceBuilder>;
