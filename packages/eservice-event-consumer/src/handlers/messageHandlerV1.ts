import {
  EServiceDescriptorStateV1,
  EServiceDescriptorV1,
  EServiceEventV1
} from "@pagopa/interop-outbound-models";
import { Logger, kafkaMessageMissingData } from "pagopa-signalhub-commons";
import { P, match } from "ts-pattern";

import { config } from "../config/env.js";
import { EserviceEntity } from "../models/domain/model.js";
import { EServiceService } from "../services/eservice.service.js";

export async function handleMessageV1(
  event: EServiceEventV1,
  eServiceService: EServiceService,
  logger: Logger
): Promise<void> {
  await match(event)
    .with(
      {
        type: "EServiceAdded"
      },
      async (evt) => {
        if (!evt.data.eservice) {
          throw kafkaMessageMissingData(config.kafkaTopic, event.type);
        }

        const { eservice } = evt.data;

        await eServiceService.addEserviceProducer(
          eservice.id,
          eservice.producerId,
          evt.stream_id,
          evt.version,
          logger
        );
      }
    )
    .with(
      {
        type: P.union("EServiceDescriptorAdded", "EServiceDescriptorUpdated")
      },
      async (evt) => {
        const { eserviceId, eserviceDescriptor } = evt.data;

        if (!eserviceDescriptor) {
          throw kafkaMessageMissingData(config.kafkaTopic, event.type);
        }

        const eService = fromEserviceEventV1ToEserviceEntity(
          eserviceId,
          [eserviceDescriptor],
          evt.stream_id,
          evt.version
        );

        await eServiceService.upsertV1(eService, logger);
      }
    )

    .with(
      {
        type: "EServiceDeleted"
      },
      async (evt) => {
        await eServiceService.delete(evt.data.eserviceId, logger);
      }
    )
    .with(
      {
        type: "EServiceWithDescriptorsDeleted"
      },
      async (evt) => {
        if (!evt.data.eservice) {
          throw kafkaMessageMissingData(config.kafkaTopic, event.type);
        }

        await eServiceService.deleteDescriptor(
          evt.data.eservice?.id,
          evt.data.descriptorId,
          evt.stream_id,
          evt.version,
          logger
        );
      }
    )
    .with(
      {
        type: "ClonedEServiceAdded"
      },
      async (evt) => {
        if (!evt.data.eservice) {
          throw new Error("Missing eservice data");
        }

        const eService = fromEserviceEventV1ToEserviceEntity(
          evt.data.eservice?.id,
          evt.data.eservice?.descriptors,
          evt.stream_id,
          evt.version
        );

        await eServiceService.insertEserviceAndProducerId(
          eService,
          evt.data.eservice.producerId,
          evt.stream_id,
          evt.version,
          logger
        );
      }
    )
    .with(
      {
        type: P.union(
          "EServiceUpdated",
          "EServiceDocumentAdded",
          "EServiceDocumentDeleted",
          "EServiceDocumentUpdated",
          "MovedAttributesFromEserviceToDescriptors"
        )
      },

      async () => {
        logger.info(`Skip event (not relevant)`);
      }
    )
    .exhaustive();
}

export const fromEserviceEventV1ToEserviceEntity = (
  eServiceId: string,
  descriptorsData: EServiceDescriptorV1[],
  streamId: string,
  version: number
): EserviceEntity => ({
  eservice_id: eServiceId,
  descriptors: descriptorsData.map((descriptor) => ({
    descriptor_id: descriptor.id,
    state: EServiceDescriptorStateV1[descriptor.state]
  })),

  event_stream_id: streamId,
  event_version_id: version
});
