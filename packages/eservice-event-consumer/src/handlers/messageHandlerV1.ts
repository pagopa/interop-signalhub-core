import {
  EServiceAddedV1,
  EServiceEventV1,
} from "@pagopa/interop-outbound-models";
import { Logger } from "pagopa-signalhub-commons";
import { match } from "ts-pattern";
import { EServiceService } from "../services/eservice.service.js";
import { EserviceEntity } from "../models/domain/model.js";
import { getSemanticMajorVersion } from "../utils/index.js";

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
        const eService = FromEserviceAddedV1ToEserviceEntiy(
          evt.data,
          evt.stream_id,
          evt.version
        );

        eServiceService.insert(eService, logger);
      }
    )
    .with(
      {
        type: "EServiceUpdated",
      },
      async (evt) => {
        console.log("TODO", evt);
      }
    )
    .with(
      {
        type: "EServiceDescriptorAdded",
      },
      async (evt) => {
        console.log("TODO", evt);

        const { eserviceId, eserviceDescriptor } = evt.data;

        eServiceService.insertDescriptor(
          eserviceId,
          eserviceDescriptor?.id,
          evt.stream_id,
          evt.version,
          logger
        );
      }
    )
    .with(
      {
        type: "EServiceDescriptorUpdated",
      },
      async (evt) => {
        console.log("TODO", evt);
      }
    )
    .with(
      {
        type: "EServiceDeleted",
      },
      async (evt) => {
        console.log("TODO", evt);
      }
    )
    .with(
      {
        type: "EServiceDocumentDeleted",
      },
      async (evt) => {
        console.log("TODO", evt);
      }
    )
    .otherwise(async () => {
      logger.debug(`Event type ${event.type} not relevant`);
    });
}

export const FromEserviceAddedV1ToEserviceEntiy = (
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
      descriptor_id: descriptors.length > 0 ? eservice.descriptors[0].id : "-",
      eservice_version:
        descriptors.length > 0
          ? getSemanticMajorVersion(eservice.descriptors[0].version)
          : null,

      state: descriptors.length > 0 ? descriptors[0].state : -1, // TODO: Change this
      event_stream_id: streamId,
      event_version_id: version,
    };
  }

  throw new Error("Eservice not found");
};
