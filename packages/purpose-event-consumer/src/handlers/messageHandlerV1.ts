/* eslint-disable @typescript-eslint/no-empty-function */
import { Logger } from "pagopa-signalhub-commons";
import {
  PurposeEventV1,
  PurposeStateV1,
  PurposeV1,
  PurposeVersionV1,
} from "@pagopa/interop-outbound-models";

import { P, match } from "ts-pattern";
import { PurposeEntity } from "../models/domain/model.js";
import { PurposeService } from "../services/purpose.service.js";
import { isPurposeWithoutVersions } from "../utils/index.js";

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
        ),
      },

      async (evt) => {
        logger.debug(`Event type ${evt.type} not relevant`);
      }
    )
    .exhaustive();
}

export const toPurposeV1Entity = (
  event: PurposeEventV1,
  purpose: PurposeV1
): PurposeEntity => {
  const { stream_id: streamId, version } = event;
  const { versionId, state } = toPurposeVersionV1Entity(purpose.versions);
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
const toPurposeVersionV1Entity = (
  purposeVersions: PurposeVersionV1[]
): { versionId: string; state: string } =>
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
    .otherwise(() => {
      const { length: l, [l - 1]: lastVersion } = purposeVersions;
      return {
        versionId: lastVersion.id,
        state: lastVersion.state.toString(),
      };
    });

function getVersionBy(
  purposeState: PurposeStateV1,
  purposeVersions: PurposeVersionV1[]
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
