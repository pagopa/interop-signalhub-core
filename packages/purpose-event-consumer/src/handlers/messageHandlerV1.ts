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
      if (isPurposeWithoutVersions(evt.data.purpose)) {
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
        await purposeService.update(
          toPurposeV1Entity(evt.data.purpose, evt.stream_id, evt.version),
          logger
        );
      }
    )
    .with(
      {
        type: P.union(
          "PurposeVersionCreated",
          "PurposeVersionUpdated",
          "PurposeVersionDeleted",
          "PurposeVersionRejected"
        ),
      },

      async (evt) => {
        logger.debug(`Event type ${evt.type} not relevant`);
      }
    )
    .with({ type: "PurposeDeleted" }, async (evt) => {
      await purposeService.delete(evt.data.purposeId, evt.stream_id, logger);
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
): { versionId: string; state: string } => {
  if (
    purposeVersions.some((version) => version.state === PurposeStateV1.ACTIVE)
  ) {
    return purposeVersions
      .filter((version) => version.state === PurposeStateV1.ACTIVE)
      .reduce((obj, version) => {
        const { id, state } = version;
        return { ...obj, versionId: id, state: state.toString() };
      }, {} as { versionId: string; state: string });
  }
  const { length: l, [l - 1]: lastVersion } = purposeVersions;
  return {
    versionId: lastVersion.id,
    state: lastVersion.state.toString(),
  };
};

const isPurposeWithoutVersions = (purpose: PurposeV1): boolean =>
  Array.isArray(purpose.versions) && purpose.versions.length === 0;
