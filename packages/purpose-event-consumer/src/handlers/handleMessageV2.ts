import { Logger, kafkaMessageMissingData } from "pagopa-signalhub-commons";
import { PurposeEventV2 } from "@pagopa/interop-outbound-models";
import { P, match } from "ts-pattern";
import { PurposeService } from "../services/purpose.service.js";
import { config } from "../config/env.js";
import {
  hasPurposeVersionInAValidState,
  toPurposeV2Entity,
} from "./messageHandlerV2.js";

export async function handleMessageV2(
  event: PurposeEventV2,
  purposeService: PurposeService,
  logger: Logger
): Promise<void> {
  logger.info(`Processing event version: ${event.event_version}`);

  await match(event)
    .with(
      {
        type: P.union(
          "PurposeActivated",
          "NewPurposeVersionActivated",
          "PurposeVersionActivated",
          "PurposeVersionUnsuspendedByProducer",
          "PurposeVersionUnsuspendedByConsumer",
          "PurposeVersionSuspendedByProducer",
          "PurposeVersionSuspendedByConsumer",
          "PurposeVersionOverQuotaUnsuspended",
          "PurposeArchived"
        ),
      },
      async (evt) => {
        if (!evt.data.purpose) {
          throw kafkaMessageMissingData(config.kafkaTopic, event.type);
        }
        if (hasPurposeVersionInAValidState(evt.data.purpose.versions)) {
          throw kafkaMessageMissingData();
        }
        await purposeService.upsert(
          toPurposeV2Entity(evt, evt.data.purpose),
          logger
        );
      }
    )
    .with(
      {
        type: P.union(
          "PurposeAdded",
          "DraftPurposeUpdated",
          "PurposeWaitingForApproval",
          "DraftPurposeDeleted",
          "WaitingForApprovalPurposeDeleted",
          "NewPurposeVersionWaitingForApproval",
          "WaitingForApprovalPurposeVersionDeleted",
          "PurposeVersionRejected",
          "PurposeCloned"
        ),
      },
      async (evt) => {
        logger.debug(`Event type ${evt.type} not relevant`);
      }
    )
    .exhaustive();
}
