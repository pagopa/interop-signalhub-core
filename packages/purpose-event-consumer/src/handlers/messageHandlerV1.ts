import {
  PurposeEventV1,
  PurposeStateV1,
  PurposeV1,
  PurposeVersionV1
} from "@pagopa/interop-outbound-models";
import { Logger, kafkaMessageMissingData } from "pagopa-signalhub-commons";
import { P, match } from "ts-pattern";

import { config } from "../config/env.js";
import { kafkaInvalidVersion } from "../models/domain/errors.js";
import { PurposeEntity } from "../models/domain/model.js";
import { PurposeService } from "../services/purpose.service.js";

export async function handleMessageV1(
  event: PurposeEventV1,
  purposeService: PurposeService,
  logger: Logger
): Promise<void> {
  await match(event)
    .with(
      {
        type: P.union(
          "PurposeVersionActivated",
          "PurposeVersionSuspended",
          "PurposeVersionArchived"
        )
      },
      async (evt) => {
        if (!evt.data.purpose) {
          throw kafkaMessageMissingData(config.kafkaTopic, event.type);
        }
        await purposeService.upsert(
          toPurposeV1Entity(evt, evt.data.purpose),
          logger
        );
      }
    )
    .with(
      {
        type: P.union(
          "PurposeCreated",
          "PurposeUpdated",
          "PurposeVersionWaitedForApproval",
          "PurposeVersionCreated",
          "PurposeVersionUpdated",
          "PurposeVersionDeleted",
          "PurposeVersionRejected",
          "PurposeDeleted"
        )
      },

      async () => {
        logger.info(`Skip event (not relevant)`);
      }
    )
    .exhaustive();
}

export const toPurposeV1Entity = (
  event: PurposeEventV1,
  purpose: PurposeV1
): PurposeEntity => {
  const { stream_id: streamId, version } = event;
  const validVersion = validVersionInVersionsV1(purpose.versions);
  if (!validVersion) {
    throw kafkaInvalidVersion();
  }
  return {
    purposeId: purpose.id,
    eserviceId: purpose.eserviceId,
    consumerId: purpose.consumerId,
    purposeState: validVersion.state,
    purposeVersionId: validVersion.versionId,
    eventStreamId: streamId,
    eventVersionId: version
  };
};
const validVersionInVersionsV1 = (
  purposeVersions: PurposeVersionV1[]
): { versionId: string; state: string } | undefined =>
  match(purposeVersions)
    .when(
      (versions) =>
        versions.some((version) => version.state === PurposeStateV1.ACTIVE),
      () => getVersionBy(PurposeStateV1.ACTIVE, purposeVersions)
    )
    .when(
      (versions) =>
        versions.some((version) => version.state === PurposeStateV1.SUSPENDED),
      () => getVersionBy(PurposeStateV1.SUSPENDED, purposeVersions)
    )
    .when(
      (versions) =>
        versions.some((version) => version.state === PurposeStateV1.ARCHIVED),
      () => getVersionBy(PurposeStateV1.ARCHIVED, purposeVersions)
    )
    .when(
      (versions) =>
        versions.some((version) => version.state === PurposeStateV1.REJECTED),
      () => getVersionBy(PurposeStateV1.REJECTED, purposeVersions)
    )
    .when(
      (versions) =>
        versions.some((version) => version.state === PurposeStateV1.DRAFT),
      () => getVersionBy(PurposeStateV1.DRAFT, purposeVersions)
    )
    .when(
      (versions) =>
        versions.some(
          (version) => version.state === PurposeStateV1.WAITING_FOR_APPROVAL
        ),
      () => getVersionBy(PurposeStateV1.WAITING_FOR_APPROVAL, purposeVersions)
    )
    .otherwise(() => undefined);

const getVersionBy = (
  purposeState: PurposeStateV1,
  purposeVersions: PurposeVersionV1[]
): {
  versionId: string;
  state: string;
} =>
  purposeVersions
    .filter((version) => version.state === purposeState)
    .reduce(
      (obj, version) => {
        const { id, state } = version;
        return { ...obj, versionId: id, state: PurposeStateV1[state] };
      },
      {} as { versionId: string; state: string }
    );
