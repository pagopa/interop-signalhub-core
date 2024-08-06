import {
  EServiceDescriptorV1,
  EServiceEventV1,
} from "@pagopa/interop-outbound-models";
import { Logger } from "pagopa-signalhub-commons";
import { P, match } from "ts-pattern";
import { EServiceService } from "../services/eservice.service.js";
import { EserviceEntity } from "../models/domain/model.js";

export async function handleMessageV1(
  event: EServiceEventV1,
  eServiceService: EServiceService,
  logger: Logger
): Promise<void> {
  await match(event)
    .with(
      {
        type: "EServiceAdded",
      },
      async (evt) => {
        if (!evt.data.eservice) {
          throw new Error("Missing eservice data");
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
        type: "EServiceDescriptorAdded",
      },
      async (evt) => {
        const { eserviceId, eserviceDescriptor } = evt.data;

        if (!eserviceDescriptor) {
          throw new Error("Missing eserviceDescriptor");
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
        type: "EServiceUpdated",
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

        await eServiceService.upsertV1(eService, logger);
      }
    )

    .with(
      {
        type: "EServiceDescriptorUpdated",
      },
      async (evt) => {
        const { eserviceId, eserviceDescriptor } = evt.data;

        if (!eserviceDescriptor) {
          throw new Error("Missing eserviceDescriptor");
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
        type: "EServiceDeleted",
      },
      async (evt) => {
        await eServiceService.delete(evt.data.eserviceId, logger);
      }
    )
    .with(
      {
        type: "EServiceWithDescriptorsDeleted",
      },
      async (evt) => {
        if (!evt.data.eservice) {
          throw new Error("Missing eservice data");
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
        type: "ClonedEServiceAdded",
      },
      async (evt) => {
        // viene clonato l'eservice con tutti i suoi descrittori?
        if (!evt.data.eservice) {
          throw new Error("Missing eservice data");
        }

        const eService = fromEserviceEventV1ToEserviceEntity(
          evt.data.eservice?.id,
          evt.data.eservice?.descriptors,
          evt.stream_id,
          evt.version
        );

        await eServiceService.upsertV1(eService, logger);
      }
    )
    .with(
      {
        type: P.union(
          "EServiceDocumentAdded",
          "EServiceDocumentDeleted",
          "EServiceDocumentUpdated",
          "MovedAttributesFromEserviceToDescriptors"
        ),
      },

      async (evt) => {
        logger.debug(`Event type ${evt.type} not relevant`);
      }
    )
    .exhaustive();
}

export const fromEserviceEventV1ToEserviceEntity = (
  eServiceId: string,
  descriptorsData: EServiceDescriptorV1[],
  streamId: string,
  version: number
): EserviceEntity => {
  return {
    eservice_id: eServiceId,
    descriptors: descriptorsData.map((descriptor) => ({
      descriptor_id: descriptor.id,
      state: descriptor.state as unknown as string, // TODO: to fix
    })),

    event_stream_id: streamId,
    event_version_id: version,
  };
};
