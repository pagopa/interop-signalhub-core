import {
  EServiceAddedV1,
  EServiceEventV1,
} from "@pagopa/interop-outbound-models";
import { Logger } from "pagopa-signalhub-commons";
import { match } from "ts-pattern";
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
        const eService = fromEserviceAddedV1ToEserviceEntiy(
          evt.data,
          evt.stream_id,
          evt.version
        );

        eServiceService.insert(eService, logger);
      }
    )
    .with(
      {
        type: "EServiceDescriptorAdded",
      },
      async (evt) => {
        console.log("TODO", evt);
        const { eserviceId, eserviceDescriptor } = evt.data;

        if (!eserviceDescriptor) {
          throw new Error("Missing eserviceDescriptor");
        }

        eServiceService.updateEserviceDescriptor(
          eserviceId,
          eserviceDescriptor,
          evt.stream_id,
          evt.version,
          logger
        );
      }
    )
    .with(
      {
        type: "EServiceUpdated",
      },
      async (evt) => {
        const eService = fromEserviceAddedV1ToEserviceEntiy(
          evt.data,
          evt.stream_id,
          evt.version
        );

        eServiceService.update(eService, logger);
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

        eServiceService.updateEserviceDescriptor(
          eserviceId,
          eserviceDescriptor,
          evt.stream_id,
          evt.version,
          logger
        );
      }
    )
    .with(
      {
        type: "EServiceDeleted",
      },
      async (evt) => {
        evt.data.eserviceId;
        // Si può cancellare senza che il suo descrittor sia stato cancellato?
        eServiceService.delete(evt.data.eserviceId, logger);
      }
    )
    .with(
      {
        type: "EServiceWithDescriptorsDeleted",
      },
      async (evt) => {
        // viene clonato l'eservice con tutti i suoi descrittori?
        console.log("TODO", evt);
      }
    )
    .with(
      {
        type: "ClonedEServiceAdded",
      },
      async (evt) => {
        // viene clonato l'eservice con tutti i suoi descrittori?
        console.log("TODO", evt);
      }
    )
    .otherwise(async () => {
      logger.debug(`Event type ${event.type} not relevant`);
    });
}

export const fromEserviceAddedV1ToEserviceEntiy = (
  eserviceEvent: EServiceAddedV1,
  streamId: string,
  version: number
): EserviceEntity => {
  const { eservice } = eserviceEvent;

  if (eservice) {
    const { descriptors } = eservice;
    return {
      eservice_id: eservice.id,
      producer_id: eservice.producerId,
      descriptor_id:
        descriptors.length > 0
          ? eservice.descriptors[descriptors.length - 1].id
          : "-",
      eservice_version:
        descriptors.length > 0
          ? parseInt(descriptors[descriptors.length - 1].version)
          : null,

      // TODO: Capire se salvare stringa o enum
      state:
        descriptors.length > 0 ? descriptors[descriptors.length - 1].state : -1,
      event_stream_id: streamId,
      event_version_id: version,
    };
  }

  throw new Error("Eservice not found");
};
