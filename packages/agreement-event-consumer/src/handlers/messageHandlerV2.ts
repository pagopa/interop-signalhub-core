import {
  AgreementEventV2,
  AgreementStampsV2,
  AgreementStateV2,
  AgreementV2
} from "@pagopa/interop-outbound-models";
import { Logger, kafkaMessageMissingData } from "pagopa-signalhub-commons";
import { P, match } from "ts-pattern";

import { config } from "../config/env.js";
import { AgreementEntity } from "../models/domain/model.js";
import { AgreementService } from "../services/agreement.service.js";

export async function handleMessageV2(
  event: AgreementEventV2,
  agreementService: AgreementService,
  logger: Logger
): Promise<void> {
  await match(event)
    .with(
      { type: P.union("AgreementAdded", "AgreementUpgraded") },
      async (evt) => {
        // Added Agreement
        await agreementService.insert(
          toAgreementEntity(
            evt.data.agreement,
            evt.stream_id,
            evt.version,
            event.type
          ),
          logger
        );
      }
    )
    .with(
      {
        type: P.union(
          "AgreementActivated",
          "AgreementArchivedByConsumer",
          "AgreementArchivedByUpgrade",
          "AgreementSetDraftByPlatform",
          "AgreementSetMissingCertifiedAttributesByPlatform",
          "AgreementSuspendedByConsumer",
          "AgreementSuspendedByProducer",
          "AgreementSuspendedByPlatform",
          "AgreementUnsuspendedByConsumer",
          "AgreementUnsuspendedByProducer",
          "AgreementUnsuspendedByPlatform",
          "AgreementRejected",
          "DraftAgreementUpdated",
          "AgreementSubmitted"
        )
      },

      async (evt) => {
        await agreementService.update(
          toAgreementEntity(
            evt.data.agreement,
            evt.stream_id,
            evt.version,
            event.type
          ),
          logger
        );
      }
    )
    .with(
      { type: "AgreementDeleted" },

      async (evt) => {
        await agreementService.delete(
          toAgreementId(evt.data.agreement),
          evt.stream_id,
          logger
        );
      }
    )
    .with(
      {
        type: P.union(
          "AgreementConsumerDocumentAdded",
          "AgreementConsumerDocumentRemoved"
        )
      },
      async () => {
        logger.info(`Skip event (not relevant)`);
      }
    )
    .exhaustive();
}

const toAgreementId = (agreement: AgreementV2 | undefined): string => {
  if (!agreement?.id) {
    throw new Error("Invalid agreement");
  }

  return agreement.id;
};

const toAgreementEntity = (
  agreement: AgreementV2 | undefined,
  streamId: string,
  version: number,
  eventType: string
): AgreementEntity => {
  if (!agreement) {
    throw kafkaMessageMissingData(config.kafkaTopic, eventType);
  }
  return {
    agreement_id: agreement.id,
    eservice_id: agreement.eserviceId,
    descriptor_id: agreement.descriptorId,
    consumer_id: agreement.consumerId,
    state: AgreementStateV2[agreement.state],
    event_stream_id: streamId,
    event_version_id: version,
    delegation_id: getDelegationId(agreement?.stamps)
  };
};

const getDelegationId = (stamps?: AgreementStampsV2): string | undefined =>
  // If delegation has been submitted, delegationID will be available within submission's stamps
  stamps?.submission?.delegationId;
