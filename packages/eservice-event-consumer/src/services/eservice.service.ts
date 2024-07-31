import { Logger } from "pagopa-signalhub-commons";
import { IEserviceRepository } from "../repositories/eservice.repository.js";
import { EserviceEntity } from "../models/domain/model.js";

export function eServiceServiceBuilder(
  eServiceRepository: IEserviceRepository
) {
  return {
    async insert(eService: EserviceEntity, logger: Logger): Promise<void> {
      logger.debug(`inserting event: ${JSON.stringify(eService, null, 2)}`);

      const eventWasProcessed = await eServiceRepository.eventWasProcessed(
        eService.event_stream_id,
        eService.event_version_id
      );

      if (eventWasProcessed) {
        return;
      }

      await eServiceRepository.insertEservice(eService);
    },

    async update(eService: EserviceEntity, logger: Logger): Promise<void> {
      logger.debug(`updating  event: ${JSON.stringify(eService, null, 2)}`);
      // Aggiorno la coppia eservice/descriptor con i nuovi dati
    },

    async insertDescriptor(
      eServiceId: string,
      descriptorId: string | undefined,
      eventStreamId: string,
      eventVersionId: number,
      logger: Logger
    ): Promise<void> {
      logger.debug(`create new descriptorId event for Eservice ${eServiceId}`);

      if (!descriptorId) {
        throw Error("Missing descriptorId");
      }

      const eventWasProcessed = await eServiceRepository.eventWasProcessed(
        eventStreamId,
        eventVersionId
      );

      if (eventWasProcessed) {
        return;
      }

      // Se esiste eserviceId allora se la versione è successiva a quella attuale , aggiorno la riga.
    },

    async delete(eService: EserviceEntity, logger: Logger): Promise<void> {
      logger.debug(`delete eService: ${JSON.stringify(eService, null, 2)}`);
    },
  };
}

export type EServiceService = ReturnType<typeof eServiceServiceBuilder>;
