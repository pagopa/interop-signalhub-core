/* eslint-disable @typescript-eslint/no-empty-function */
import { Logger } from "pagopa-signalhub-commons";
import {
  PurposeEventV1,
  PurposeV1,
  PurposeVersionV1,
} from "@pagopa/interop-outbound-models";

import { P, match } from "ts-pattern";
import { PurposeEntity } from "../models/domain/model.js";
import { PurposeService } from "../services/purpose.service.js";

export async function handleMessageV1(
  event: PurposeEventV1,
  purposeService: PurposeService,
  logger: Logger
): Promise<void> {
  await match(event)
    .with({ type: "PurposeCreated" }, async (evt) => {
      if (!evt.data.purpose) {
        throw new Error("Missing purpose");
      }
      if (evt.data.purpose.versions.length === 0) {
        // no version no state
        return;
      }
      await purposeService.insert(
        toPurposeV1Entity(evt.data.purpose, evt.stream_id, evt.version),
        logger
      );
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
  purpose: PurposeV1,
  streamId: string,
  version: number
): PurposeEntity => {
  const { versionId, state } = toPurposeVersionV1ToEntity(purpose.versions);
  return {
    purposeId: purpose.id,
    eserviceId: purpose.eserviceId,
    consumerId: purpose.consumerId,
    purposeState: state,
    purposeVersionId: versionId,
    eventStreamId: streamId,
    eventVersionId: version,
  };
};
const toPurposeVersionV1ToEntity = (
  purposeVersions: PurposeVersionV1[]
): { versionId: string; state: string } => ({
  versionId: purposeVersions[0].id,
  state: purposeVersions[0].state.toString(),
});
