/* eslint-disable @typescript-eslint/no-empty-function */
import { Logger } from "pagopa-signalhub-commons";
import { PurposeEventV1, PurposeV1 } from "@pagopa/interop-outbound-models";

import { P, match } from "ts-pattern";
import { PurposeEntity } from "../models/domain/model.js";
import { PurposeService } from "../services/purpose.service.js";

export async function handleMessageV1(
  event: PurposeEventV1,
  _purposeService: PurposeService,
  logger: Logger
): Promise<void> {
  await match(event)
    .with({ type: "PurposeCreated" }, async (evt) => {
      logger.debug(`Event type ${evt.type} not relevant`);
    })
    .with(
      {
        type: P.union(
          "PurposeUpdated",
          "PurposeVersionWaitedForApproval",
          "PurposeVersionActivated",
          "PurposeVersionSuspended",
          "PurposeVersionCreated",
          "PurposeVersionArchived",
          "PurposeVersionUpdated",
          "PurposeVersionDeleted"
        ),
      },

      async (evt) => {
        logger.debug(`Event type ${evt.type} not relevant`);
      }
    )
    .with({ type: "PurposeDeleted" }, async (evt) => {
      logger.debug(`Event type ${evt.type} not relevant`);
    })
    .with({ type: "PurposeVersionRejected" }, async (evt) => {
      logger.debug(`Event type ${evt.type} not relevant`);
    })
    .exhaustive();
}

export const toPurposeV1Entity = (
  purpose: PurposeV1 | undefined,
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
