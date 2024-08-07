import {
  EServiceDescriptorV2,
  EServiceEventV2,
  EServiceV2,
} from "@pagopa/interop-outbound-models";
import { Logger } from "pagopa-signalhub-commons";
import { P, match } from "ts-pattern";
import { EserviceV2Entity } from "../models/domain/model.js";
import { EServiceService } from "../services/eservice.service.js";

export async function handleMessageV2(
  event: EServiceEventV2,
  eServiceService: EServiceService,
  logger: Logger
): Promise<void> {
  await match(event)
    .with(
      {
        type: P.union(
          "EServiceAdded",
          "EServiceCloned",
          "DraftEServiceUpdated"
        ),
      },
      async (evt) => {
        const { eservice } = evt.data;

        if (!eservice) {
          throw new Error("Missing eservice data");
        }
        const eService = fromEserviceEventV2ToEserviceEntity(
          eservice,
          evt.stream_id,
          evt.version
        );

        await eServiceService.upsertV2(eService, logger);
      }
    )

    .with(
      {
        type: P.union(
          // "EServiceCloned",
          "EServiceDescriptorAdded",
          // "EServiceAdded",
          "EServiceDescriptorActivated",
          "EServiceDescriptorArchived",
          "EServiceDescriptorPublished",
          "EServiceDescriptorSuspended",
          "EServiceDraftDescriptorUpdated"
          // "DraftEServiceUpdated"
        ),
      },
      async (evt) => {
        const { eservice, descriptorId } = evt.data;

        if (!eservice) {
          throw new Error("Missing eservice data");
        }

        // Get only descriptors that need to be updated
        // eslint-disable-next-line functional/immutable-data
        eservice.descriptors = getFilteredDescriptors(
          descriptorId,
          eservice.descriptors
        );

        const eService = fromEserviceEventV2ToEserviceEntity(
          eservice,
          evt.stream_id,
          evt.version
        );

        await eServiceService.upsertV2(eService, logger);
      }
    )

    .with(
      {
        type: "EServiceDeleted",
      },
      async (evt) => {
        const { eserviceId } = evt.data;

        await eServiceService.delete(eserviceId, logger);
      }
    )

    .with(
      {
        type: "EServiceDraftDescriptorDeleted",
      },
      async (evt) => {
        logger.debug(`Event type ${evt.type} not relevant`);
        const { eservice } = evt.data;

        if (!eservice) {
          throw new Error("Missing eservice data");
        }
        const eService = fromEserviceEventV2ToEserviceEntity(
          eservice,
          evt.stream_id,
          evt.version
        );

        await eServiceService.upsertV2(eService, logger);
      }
    )
    .with(
      {
        type: P.union(
          "EServiceDescriptionUpdated",
          "EServiceDescriptorDocumentAdded",
          "EServiceDescriptorDocumentDeleted",
          "EServiceDescriptorDocumentUpdated",
          "EServiceDescriptorInterfaceAdded",
          "EServiceDescriptorInterfaceDeleted",
          "EServiceDescriptorQuotasUpdated",
          "EServiceDescriptorInterfaceDeleted",
          "EServiceDescriptorInterfaceUpdated",
          "EServiceDescriptorQuotasUpdated"
        ),
      },
      async (evt) => {
        logger.debug(`Event type ${evt.type} not relevant`);
      }
    )
    .exhaustive();
}

export const fromEserviceEventV2ToEserviceEntity = (
  eService: EServiceV2,
  streamId: string,
  version: number
): EserviceV2Entity => ({
  eservice_id: eService.id,
  producer_id: eService.producerId,

  descriptors: eService.descriptors.map((descriptor) => ({
    descriptor_id: descriptor.id,
    state: descriptor.state as unknown as string, // TODO: to fix
  })),

  event_stream_id: streamId,
  event_version_id: version,
});

const getFilteredDescriptors = (
  descriptorId: string,
  descriptors: EServiceDescriptorV2[]
): EServiceDescriptorV2[] => descriptors.filter((d) => d.id === descriptorId);
