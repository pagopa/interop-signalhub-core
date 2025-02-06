import {
  PurposeEventV2,
  PurposeStateV2,
  PurposeV2,
  PurposeVersionV2
} from "@pagopa/interop-outbound-models";
import { Logger, kafkaMessageMissingData } from "pagopa-signalhub-commons";
import { P, match } from "ts-pattern";

import { config } from "../config/env.js";
import { kafkaInvalidVersion } from "../models/domain/errors.js";
import { PurposeEntity } from "../models/domain/model.js";
import { PurposeService } from "../services/purpose.service.js";

export async function handleMessageV2(
  event: PurposeEventV2,
  purposeService: PurposeService,
  logger: Logger
): Promise<void> {
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
          "PurposeArchived",
          "PurposeVersionArchivedByRevokedDelegation"
        )
      },
      async (evt) => {
        if (!evt.data.purpose) {
          throw kafkaMessageMissingData(config.kafkaTopic, event.type);
        }
        if (hasPurposeVersionInAValidState(evt.data.purpose.versions)) {
          throw kafkaInvalidVersion();
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
          "PurposeCloned",
          "PurposeDeletedByRevokedDelegation"
        )
      },
      async () => {
        logger.info(`Skip event (not relevant)`);
      }
    )
    .exhaustive();
}

export const toPurposeV2Entity = (
  event: PurposeEventV2,
  purpose: PurposeV2
): PurposeEntity => {
  const { stream_id: streamId, version } = event;
  const validVersion = validVersionInVersionsV2(purpose.versions);
  if (!validVersion) {
    throw kafkaInvalidVersion();
  }

  return {
    purposeId: purpose.id,
    eserviceId: purpose.eserviceId,
    consumerId: purpose.consumerId,
    purposeState: validVersion.state,
    purposeVersionId: validVersion.versionId,
    delegationId: purpose.delegationId,
    eventStreamId: streamId,
    eventVersionId: version
  };
};
const validVersionInVersionsV2 = (
  purposeVersions: PurposeVersionV2[]
): { versionId: string; state: string } | undefined =>
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
    .otherwise(() => undefined);

function getVersionBy(
  purposeState: PurposeStateV2,
  purposeVersions: PurposeVersionV2[]
): {
  versionId: string;
  state: string;
} {
  return purposeVersions
    .filter((version) => version.state === purposeState)
    .reduce(
      (obj, version) => {
        const { id, state } = version;
        return { ...obj, versionId: id, state: PurposeStateV2[state] };
      },
      {} as { versionId: string; state: string }
    );
}

const hasPurposeVersionInAValidState = (
  versions: PurposeVersionV2[]
): boolean => !validVersionInVersionsV2(versions);
