import { EServiceDescriptorV2 } from "@pagopa/interop-outbound-models";
import { Logger } from "pagopa-signalhub-commons";

import { EserviceEntity, EserviceV2Entity } from "../models/domain/model.js";
import { IEserviceProduceRepository } from "../repositories/eServiceProducer.repository.js";
import { IEserviceRepository } from "../repositories/eservice.repository.js";

export interface IEServiceService {
  readonly addEserviceProducer: (
    eServiceId: string,
    producerId: string,
    eventStreamId: string,
    eventVersionId: number,
    logger: Logger
  ) => Promise<void>;

  readonly delete: (eServiceId: string, logger: Logger) => Promise<void>;

  readonly deleteDescriptor: (
    eServiceId: string,
    descriptorId: string,
    eventStreamId: string,
    eventVersionId: number,
    logger: Logger
  ) => Promise<void>;

  readonly deleteDescritorV2: (
    eServiceId: string,
    descriptors: EServiceDescriptorV2[],
    logger: Logger
  ) => Promise<void>;

  readonly insertEserviceAndProducerId: (
    eService: EserviceEntity,
    producerId: string,
    eventStreamId: string,
    eventVersionId: number,
    logger: Logger
  ) => Promise<void>;

  readonly upsertV1: (
    eService: EserviceEntity,
    logger: Logger
  ) => Promise<void>;

  readonly upsertV2: (
    eService: EserviceV2Entity,
    logger: Logger
  ) => Promise<void>;
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
      logger.info(
        `Saving event (insert) : eServiceId: ${eServiceId}, producerId: ${producerId}`
      );

      const eventWasProcessed =
        await eServiceProducerRepository.eventWasProcessed(
          eventStreamId,
          eventVersionId
        );

      if (eventWasProcessed) {
        logger.info(`Skip event (idempotence)`);
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

        if (eventWasProcessed) {
          logger.info(`Skip event (idempotence)`);
          return;
        }

        // TODO: Add check for STATE ARCHIVE
        logger.info(
          `Saving event (upsertV1) descriptor descriptorId: ${descriptor.descriptor_id}, producerId: ${producerId}, state: ${descriptor.state}
          )}`
        );

        await eServiceRepository.upsertDescriptor(
          eService.eservice_id,
          producerId as string,
          descriptor,
          eService.event_stream_id,
          eService.event_version_id
        );
      }
    },

    /**
     * This method add a procuderId on eservice_producer table, after that insert new eservice
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
      for (const descriptor of eService.descriptors) {
        const eventWasProcessed = await eServiceRepository.eventWasProcessed(
          descriptor.descriptor_id,
          eService.event_stream_id,
          eService.event_version_id
        );

        if (eventWasProcessed) {
          logger.info(`Skip event (idempotence)`);
          return;
        }

        // TODO: Add check for STATE ARCHIVE
        logger.info(
          `Saving event (upsertV2) descriptor descriptorId: ${descriptor.descriptor_id}, producerId: ${eService.producer_id}, state: ${descriptor.state}`
        );
        await eServiceRepository.upsertDescriptor(
          eService.eservice_id,
          eService.producer_id,
          descriptor,
          eService.event_stream_id,
          eService.event_version_id,
          eService?.isSignalHubEnabled,
          eService.isClientAccessDelegable
        );
      }
    },

    async delete(eServiceId: string, logger: Logger): Promise<void> {
      logger.info(`delete e-service with eServiceId: ${eServiceId}`);

      await eServiceRepository.delete(eServiceId);
    },
    async deleteDescriptor(
      eServiceId: string,
      descriptorId: string,
      eventStreamId: string,
      eventVersionId: number,
      logger: Logger
    ): Promise<void> {
      logger.info(
        `delete e-service descriptor with eServiceId: ${eServiceId} and descriptorId: ${descriptorId}`
      );

      const eventWasProcessed = await eServiceRepository.eventWasProcessed(
        descriptorId,
        eventStreamId,
        eventVersionId
      );

      if (eventWasProcessed) {
        logger.info(`Skip event (idempotence)`);
        return;
      }

      await eServiceRepository.deleteDescriptor(eServiceId, descriptorId);
    },

    async deleteDescritorV2(
      eServiceId: string,
      descriptors: EServiceDescriptorV2[],
      logger: Logger
    ): Promise<void> {
      descriptors.forEach(async (descriptor) => {
        logger.info(
          `delete e-service descriptor with eServiceId: ${eServiceId} and descriptorId: ${descriptor.id}`
        );
        await eServiceRepository.deleteDescriptor(eServiceId, descriptor.id);
      });
    }
  };
}
export type EServiceService = ReturnType<typeof eServiceServiceBuilder>;
