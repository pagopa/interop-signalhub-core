/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from "pagopa-signalhub-commons";
import { PurposeEntity } from "../models/domain/model.js";
import { IPurposeRepository } from "../repositories/index.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function purposeServiceBuilder(purposeRepository: IPurposeRepository) {
  return {
    // async update(purpose: PurposeEntity, logger: Logger): Promise<void> {
    //   logger.debug(`updating event: ${JSON.stringify(purpose)}`);
    //   const eventWasProcessed = await purposeRepository.eventWasProcessed(
    //     purpose.eventStreamId,
    //     purpose.eventVersionId
    //   );
    //   logger.debug(`event was already processed: ${eventWasProcessed}`);
    //   if (eventWasProcessed) {
    //     return;
    //   }
    //   await purposeRepository.update(purpose);
    // },
    async upsert(purpose: PurposeEntity, logger: Logger): Promise<void> {
      logger.debug(`upserting event: ${JSON.stringify(purpose)}`);
      const eventWasProcessed = await purposeRepository.eventWasProcessed(
        purpose.eventStreamId,
        purpose.eventVersionId
      );
      logger.debug(`event was already processed: ${eventWasProcessed}`);
      if (eventWasProcessed) {
        return;
      }
      await purposeRepository.upsert(purpose);
    },
    // async insert(purpose: PurposeEntity, logger: Logger): Promise<void> {
    //   logger.debug(`inserting event: ${JSON.stringify(purpose, null, 2)}`);
    //   const eventWasProcessed = await purposeRepository.eventWasProcessed(
    //     purpose.eventStreamId,
    //     purpose.eventVersionId
    //   );
    //   logger.debug(`event was already processed: ${eventWasProcessed}`);
    //   if (eventWasProcessed) {
    //     return;
    //   }
    //   await purposeRepository.insert(purpose);
    // },
    async delete(
      purposeId: string,
      streamId: string,
      logger: Logger
    ): Promise<void> {
      // some business logic
      logger.info(`deleting event: ${purposeId}`);
      await purposeRepository.delete(purposeId, streamId);
    },
  };
}

export type PurposeService = ReturnType<typeof purposeServiceBuilder>;
