import { Logger } from "pagopa-signalhub-commons";
import { IEserviceRepository } from "../repositories/eservice.repository.js";
import { EserviceEntity } from "../models/domain/model.js";

export function eServiceServiceBuilder(
  eServiceRepository: IEserviceRepository
) {
  return {
    async upsert(eService: EserviceEntity, logger: Logger): Promise<void> {
      logger.debug(`inserting event: ${JSON.stringify(eService, null, 2)}`);

      const eventWasProcessed = await eServiceRepository.eventWasProcessed(
        eService.event_stream_id,
        eService.event_version_id
      );
      logger.debug(`event was already processed: ${eventWasProcessed}`);

      if (eventWasProcessed) {
        return;
      }

      eService.descriptors.forEach(async (descriptor) => {
        // TODO: Add check for STATE ARCHIVE
        await eServiceRepository.upsertDescriptor(
          eService.eservice_id,
          eService.producer_id,
          descriptor,
          eService.event_stream_id,
          eService.event_version_id
        );
      });
    },

    async delete(
      eServiceId: string,
      eventStreamId: string,
      eventVersionId: number,
      logger: Logger
    ): Promise<void> {
      logger.debug(`delete eService: with ${eServiceId}`);

      const eventWasProcessed = await eServiceRepository.eventWasProcessed(
        eventStreamId,
        eventVersionId
      );
      logger.debug(`event was already processed: ${eventWasProcessed}`);

      if (eventWasProcessed) {
        return;
      }

      await eServiceRepository.delete(eServiceId);
    },
    async deleteDescriptor(
      eServiceId: string,
      descriptorId: string,
      eventStreamId: string,
      eventVersionId: number,
      logger: Logger
    ): Promise<void> {
      logger.debug(
        `delete eService: with ${eServiceId} and descriptorId: ${descriptorId}`
      );

      const eventWasProcessed = await eServiceRepository.eventWasProcessed(
        eventStreamId,
        eventVersionId
      );
      logger.debug(`event was already processed: ${eventWasProcessed}`);

      if (eventWasProcessed) {
        return;
      }

      await eServiceRepository.deleteDescriptor(eServiceId, descriptorId);
    },
  };
}

export type EServiceService = ReturnType<typeof eServiceServiceBuilder>;
