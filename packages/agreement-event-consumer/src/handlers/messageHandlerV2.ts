/* eslint-disable @typescript-eslint/no-empty-function */
import { Logger, kafkaMessageMissingData } from "pagopa-signalhub-commons";
import {
  AgreementV2,
  AgreementEventV2,
  AgreementStateV2,
} from "@pagopa/interop-outbound-models";

import { P, match } from "ts-pattern";
import { AgreementService } from "../services/agreement.service.js";
import { AgreementEntity } from "../models/domain/model.js";
import { config } from "../config/env.js";

export async function handleMessageV2(
  event: AgreementEventV2,
  agreementService: AgreementService,
  logger: Logger
): Promise<void> {
  await match(event)
    .with({ type: "AgreementAdded" }, async (evt) => {
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
    })
    .with(
      {
        type: P.union(
          "AgreementActivated",
          "AgreementArchivedByConsumer",
          "AgreementArchivedByUpgrade",
          "AgreementSetDraftByPlatform", // ??
          "AgreementSetMissingCertifiedAttributesByPlatform", // ??
          "AgreementSuspendedByConsumer",
          "AgreementSuspendedByProducer",
          "AgreementSuspendedByPlatform",
          "AgreementUnsuspendedByConsumer",
          "AgreementUnsuspendedByProducer",
          "AgreementUnsuspendedByPlatform",
          "AgreementUpgraded",
          "AgreementRejected",
          "DraftAgreementUpdated",
          "AgreementSubmitted"
        ),
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
        ),
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
  };
};
