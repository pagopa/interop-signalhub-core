/* eslint-disable @typescript-eslint/no-empty-function */
import { Logger } from "pagopa-signalhub-commons";
import { PurposeEventV2, PurposeV2 } from "@pagopa/interop-outbound-models";

import { P, match } from "ts-pattern";
import { PurposeService } from "../services/purpose.service.js";
import { PurposeEntity } from "../models/domain/model.js";

export async function handleMessageV2(
  event: PurposeEventV2,
  _purposeService: PurposeService,
  logger: Logger
): Promise<void> {
  logger.info(`Processing event version: ${event.event_version}`);

  await match(event)
    .with({ type: "PurposeAdded" }, async (evt) => {
      logger.debug(`Event type ${evt.type} not relevant`);
    })
    .with(
      {
        type: P.union(
          "DraftPurposeUpdated",
          "PurposeWaitingForApproval",
          "PurposeActivated",
          "DraftPurposeDeleted", // ??
          "WaitingForApprovalPurposeDeleted", // ??
          "NewPurposeVersionActivated",
          "PurposeVersionActivated",
          "PurposeVersionUnsuspendedByProducer",
          "PurposeVersionUnsuspendedByConsumer",
          "PurposeVersionSuspendedByProducer",
          "PurposeVersionSuspendedByConsumer",
          "NewPurposeVersionWaitingForApproval",
          "PurposeVersionOverQuotaUnsuspended",
          "PurposeArchived",
          "WaitingForApprovalPurposeVersionDeleted"
        ),
      },

      async (evt) => {
        logger.debug(`Event type ${evt.type} not relevant`);
      }
    )
    .with(
      { type: "PurposeVersionRejected" },

      async (evt) => {
        logger.debug(`Event type ${evt.type} not relevant`);
      }
    )
    .with({ type: "PurposeCloned" }, async (evt) => {
      logger.debug(`Event type ${evt.type} not relevant`);
    })

    .exhaustive();
}

/*
const toPurposeId = (purpose: PurposeV2 | undefined): string => {
  if (!purpose?.id) {
    throw new Error("Invalid purpose");
  }

  return purpose.id;
};
*/

export const toPurposeV2Entity = (
  purpose: PurposeV2 | undefined,
  streamId: string,
  version: number
): PurposeEntity => {
  if (!purpose) {
    throw new Error("Invalid purpose");
  }
  return {
    purposeId: purpose.id,
    eserviceId: purpose.eserviceId,
    consumerId: purpose.consumerId,
    purposeState: purpose.versions[0].state.toString(),
    purposeVersionId: purpose.versions[0].id,
    eventStreamId: streamId,
    eventVersionId: version,
  };
};
