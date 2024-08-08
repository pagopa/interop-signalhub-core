import { Logger } from "pagopa-signalhub-commons";
import { EServiceDescriptorV2 } from "@pagopa/interop-outbound-models";
import { IEserviceRepository } from "../repositories/eservice.repository.js";
/* eslint-disable functional/no-method-signature */

import { EserviceEntity, EserviceV2Entity } from "../models/domain/model.js";
import { IEserviceProduceRepository } from "../repositories/eServiceProducer.repository.js";

export interface IEServiceService {
  addEserviceProducer(
    eServiceId: string,
    producerId: string,
    eventStreamId: string,
    eventVersionId: number,
    logger: Logger
  ): Promise<void>;
  upsertV1(eService: EserviceEntity, logger: Logger): Promise<void>;
  insertEserviceAndProducerId(
    eService: EserviceEntity,
    producerId: string,
    eventStreamId: string,
    eventVersionId: number,
    logger: Logger
  ): Promise<void>;
  upsertV2(eService: EserviceV2Entity, logger: Logger): Promise<void>;
  delete(eServiceId: string, logger: Logger): Promise<void>;
  deleteDescriptor(
    eServiceId: string,
    descriptorId: string,
    eventStreamId: string,
    eventVersionId: number,
    logger: Logger
  ): Promise<void>;
  deleteDescritorV2(
    eServiceId: string,
    descriptors: EServiceDescriptorV2[],
    logger: Logger
  ): Promise<void>;
}
export function eServiceServiceBuilder(
  eServiceRepository: IEserviceRepository,
  eServiceProducerRepository: IEserviceProduceRepository
): IEServiceService {
  /**
   * This method will be used just for V1 version of event messages
   * to add a new eservice producer on producer_table
   */

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

      console.log("EServiceId", eServiceId, "producerId", producerId);

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

    async upsertV1(eService: EserviceEntity, logger: Logger): Promise<void> {
      logger.debug(
        `insert or update event: ${JSON.stringify(eService, null, 2)}`
      );

      const producerId =
        await eServiceProducerRepository.findProducerIdByEserviceId(
          eService.eservice_id
        );

      for (const descriptor of eService.descriptors) {
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

    /**
     * This method add a procuderId on eservice_producer table, after that insert new eservice
     * @param eService
     * @param producerId
     * @param eventStreamId
     * @param eventVersionId
     * @param logger
     */
    async insertEserviceAndProducerId(
      eService: EserviceEntity,
      producerId: string,
      eventStreamId: string,
      eventVersionId: number,
      logger: Logger
    ): Promise<void> {
      await this.addEserviceProducer(
        eService.eservice_id,
        producerId,
        eventStreamId,
        eventVersionId,
        logger
      );

      await this.upsertV1(eService, logger);
    },

    async upsertV2(eService: EserviceV2Entity, logger: Logger): Promise<void> {
      logger.debug(
        `insert or update event: ${JSON.stringify(eService, null, 2)}`
      );

      for (const descriptor of eService.descriptors) {
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
