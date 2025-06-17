import {
  EServiceDescriptorStateV2,
  EServiceEventV2,
  EServiceV2
} from "@pagopa/interop-outbound-models";
import { Logger, kafkaMessageMissingData } from "pagopa-signalhub-commons";
import { P, match } from "ts-pattern";

import { config } from "../config/env.js";
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
          "DraftEServiceUpdated",
          "EServiceDraftDescriptorDeleted",
          "EServiceDescriptorAdded",
          "EServiceDescriptorActivated",
          "EServiceDescriptorArchived",
          "EServiceDescriptorPublished",
          "EServiceDescriptorSuspended",
          "EServiceDraftDescriptorUpdated",
          "EServiceIsClientAccessDelegableDisabled",
          "EServiceIsClientAccessDelegableEnabled",
          "EServiceIsConsumerDelegableDisabled",
          "EServiceIsConsumerDelegableEnabled",
          "EServiceSignalHubEnabled",
          "EServiceSignalHubDisabled"
        )
      },
      async (evt) => {
        const { eservice } = evt.data;

        if (!eservice) {
          throw kafkaMessageMissingData(config.kafkaTopic, event.type);
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
        type: "EServiceDeleted"
      },
      async (evt) => {
        const { eserviceId } = evt.data;

        await eServiceService.delete(eserviceId, logger);
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
          "EServiceDescriptorInterfaceUpdated",
          "EServiceDescriptorAttributesUpdated",
          "EServiceDescriptorApprovedByDelegator",
          "EServiceDescriptorRejectedByDelegator",
          "EServiceDescriptorSubmittedByDelegate",
          "EServiceNameUpdated",
          "EServiceDescriptionUpdatedByTemplateUpdate",
          "EServiceDescriptorAttributesUpdatedByTemplateUpdate",
          "EServiceDescriptorDocumentAddedByTemplateUpdate",
          "EServiceDescriptorDocumentDeletedByTemplateUpdate",
          "EServiceDescriptorDocumentUpdatedByTemplateUpdate",
          "EServiceDescriptorQuotasUpdatedByTemplateUpdate",
          "EServiceNameUpdatedByTemplateUpdate",
          "EServiceDescriptorAgreementApprovalPolicyUpdated"
        )
      },
      async () => {
        logger.info(`Skip event (not relevant)`);
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
    state: EServiceDescriptorStateV2[descriptor.state]
  })),
  isSignalHubEnabled: eService?.isSignalHubEnabled,
  isClientAccessDelegable: eService.isClientAccessDelegable,
  event_stream_id: streamId,
  event_version_id: version
});
