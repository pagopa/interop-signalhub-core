import { Logger } from "pagopa-signalhub-commons";
import { IEserviceRepository } from "../repositories/eservice.repository.js";
import { EserviceEntity } from "../models/domain/model.js";
import { EServiceDescriptorV1 } from "@pagopa/interop-outbound-models";
import { toUpdateDescriptorEntity } from "../models/domain/toDbEntity.js";
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
      logger.debug(`event was already processed: ${eventWasProcessed}`);

      if (eventWasProcessed) {
        return;
      }

      await eServiceRepository.insertEservice(eService);
    },

    async update(eService: EserviceEntity, logger: Logger): Promise<void> {
      logger.debug(`updating  event: ${JSON.stringify(eService, null, 2)}`);
      // Aggiorno la coppia eservice/descriptor con i nuovi dati
    },

    async updateEserviceDescriptor(
      eServiceId: string,
      descriptorData: EServiceDescriptorV1,
      eventStreamId: string,
      eventVersionId: number,
      logger: Logger
    ): Promise<void> {
      logger.debug(`create new descriptorId event for Eservice ${eServiceId}`);

      if (!descriptorData.id) {
        throw Error("Missing descriptorId");
      }

      const eventWasProcessed = await eServiceRepository.eventWasProcessed(
        eventStreamId,
        eventVersionId
      );
      logger.debug(`event was already processed: ${eventWasProcessed}`);

      if (eventWasProcessed) {
        return;
      }

      const eServiceDescriptorEntity = toUpdateDescriptorEntity(
        eServiceId,
        descriptorData,
        eventStreamId,
        eventVersionId
      );

      console.log(eServiceDescriptorEntity);
      await eServiceRepository.updateDescriptor(eServiceDescriptorEntity);
      // Se esiste eserviceId allora se la versione è successiva a quella attuale , aggiorno la riga.
    },

    async delete(eServiceId: string, logger: Logger): Promise<void> {
      logger.debug(`delete eService: with ${eServiceId}`);
    },
  };
}

export type EServiceService = ReturnType<typeof eServiceServiceBuilder>;
