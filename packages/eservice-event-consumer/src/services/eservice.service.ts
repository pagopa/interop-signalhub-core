import { Logger } from "pagopa-signalhub-commons";
import { IEserviceRepository } from "../repositories/eservice.repository.js";
import { EserviceEntity, EserviceV2Entity } from "../models/domain/model.js";
import { IEserviceProduceRepository } from "../repositories/eServiceProducer.repository.js";
import { EServiceDescriptorV2 } from "@pagopa/interop-outbound-models";

export function eServiceServiceBuilder(
  eServiceRepository: IEserviceRepository,
  eServiceProducerRepository: IEserviceProduceRepository
) {
  return {
    async addEserviceProducer(
      eServiceId: string,
      producerId: string,
      eventStreamId: string,
      eventVersionId: number,
      logger: Logger
    ): Promise<void> {
      logger.debug(
        `Ad new eservice event: with eServiceId  ${eServiceId} and producerId ${producerId}`
      );

      const eventWasProcessed =
        await eServiceProducerRepository.eventWasProcessed(
          eventStreamId,
          eventVersionId
        );
      logger.debug(`event was already processed: ${eventWasProcessed}`);

      if (eventWasProcessed) {
        return;
      }
      await eServiceProducerRepository.insert(
        eServiceId,
        producerId,
        eventStreamId,
        eventVersionId
      );
    },

    async upsert(eService: EserviceEntity, logger: Logger): Promise<void> {
      logger.debug(
        `insert or update event: ${JSON.stringify(eService, null, 2)}`
      );

      const producerId =
        await eServiceProducerRepository.findProducerIdByEserviceId(
          eService.eservice_id
        );

      // TODO GESTIONE SE NON ESISTE

      for (let i = 0; i < eService.descriptors.length; i++) {
        const descriptor = eService.descriptors[i];
        const eventWasProcessed = await eServiceRepository.eventWasProcessed(
          descriptor.descriptor_id,
          eService.event_stream_id,
          eService.event_version_id
        );

        logger.debug(`event was already processed: ${eventWasProcessed}`);

        if (eventWasProcessed) {
          return;
        }

        // TODO: Add check for STATE ARCHIVE
        logger.debug(
          `upserting descriptor: ${JSON.stringify(descriptor, null, 2)}`
        );

        await eServiceRepository.upsertDescriptor(
          eService.eservice_id,
          producerId,
          descriptor,
          eService.event_stream_id,
          eService.event_version_id
        );
      }
    },

    async upsertV2(eService: EserviceV2Entity, logger: Logger): Promise<void> {
      logger.debug(
        `insert or update event: ${JSON.stringify(eService, null, 2)}`
      );

      for (let i = 0; i < eService.descriptors.length; i++) {
        const descriptor = eService.descriptors[i];

        const eventWasProcessed = await eServiceRepository.eventWasProcessed(
          descriptor.descriptor_id,
          eService.event_stream_id,
          eService.event_version_id
        );

        logger.debug(`event was already processed: ${eventWasProcessed}`);

        if (eventWasProcessed) {
          return;
        }

        // TODO: Add check for STATE ARCHIVE
        logger.debug(
          `upserting descriptor: ${JSON.stringify(descriptor, null, 2)}`
        );
        await eServiceRepository.upsertDescriptor(
          eService.eservice_id,
          eService.producer_id,
          descriptor,
          eService.event_stream_id,
          eService.event_version_id
        );
      }
    },

    async delete(eServiceId: string, logger: Logger): Promise<void> {
      logger.debug(`delete eService: with ${eServiceId}`);

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
        descriptorId,
        eventStreamId,
        eventVersionId
      );
      logger.debug(`event was already processed: ${eventWasProcessed}`);

      if (eventWasProcessed) {
        return;
      }

      await eServiceRepository.deleteDescriptor(eServiceId, descriptorId);
    },

    async deleteDescritorV2(
      eServiceId: string,
      descriptors: EServiceDescriptorV2[],
      logger: Logger
    ): Promise<void> {
      logger.debug(`delete descriptors: with ${descriptors}`);

      descriptors.forEach(async (descriptor) => {
        await eServiceRepository.deleteDescriptor(eServiceId, descriptor.id);
      });
    },
  };
}
export type EServiceService = ReturnType<typeof eServiceServiceBuilder>;
