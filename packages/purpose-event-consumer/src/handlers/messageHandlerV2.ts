/* eslint-disable @typescript-eslint/no-empty-function */
import { Logger } from "pagopa-signalhub-commons";
import {
  PurposeEventV2,
  PurposeStateV2,
  PurposeV2,
  PurposeVersionV2,
} from "@pagopa/interop-outbound-models";

import { P, match } from "ts-pattern";
import { PurposeService } from "../services/purpose.service.js";
import { PurposeEntity } from "../models/domain/model.js";
import { isPurposeWithoutVersions } from "../utils/index.js";

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
          throw new Error("Missing purpose");
        }
        if (isPurposeWithoutVersions(evt.data.purpose)) {
          return;
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

export const toPurposeV2Entity = (
  event: PurposeEventV2,
  purpose: PurposeV2
): PurposeEntity => {
  const { stream_id: streamId, version } = event;
  const { versionId, state } = toPurposeVersionV2Entity(purpose.versions);
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
const toPurposeVersionV2Entity = (
  purposeVersions: PurposeVersionV2[]
): { versionId: string; state: string } =>
  match(purposeVersions)
    .when(
      (versions) =>
        versions.some((version) => version.state === PurposeStateV2.ACTIVE),
      () => getVersionBy(PurposeStateV2.ACTIVE, purposeVersions)
    )
    .when(
      (versions) =>
        versions.some((version) => version.state === PurposeStateV2.SUSPENDED),
      () => getVersionBy(PurposeStateV2.SUSPENDED, purposeVersions)
    )
    .when(
      (versions) =>
        versions.some((version) => version.state === PurposeStateV2.ARCHIVED),
      () => getVersionBy(PurposeStateV2.ARCHIVED, purposeVersions)
    )
    .otherwise(() => {
      const { length: l, [l - 1]: lastVersion } = purposeVersions;
      return {
        versionId: lastVersion.id,
        state: lastVersion.state.toString(),
      };
    });

function getVersionBy(
  purposeState: PurposeStateV2,
  purposeVersions: PurposeVersionV2[]
): {
  versionId: string;
  state: string;
} {
  return purposeVersions
    .filter((version) => version.state === purposeState)
    .reduce((obj, version) => {
      const { id, state } = version;
      return { ...obj, versionId: id, state: state.toString() };
    }, {} as { versionId: string; state: string });
}
