import { randomUUID } from "crypto";
import { setupTestContainersVitest } from "pagopa-signalhub-commons-test";
import { inject } from "vitest";
import {
  PurposeV1,
  PurposeVersionV1,
  PurposeStateV1,
  PurposeEventV1,
  PurposeV2,
  PurposeEventV2,
} from "@pagopa/interop-outbound-models";
import { z } from "zod";
import { match } from "ts-pattern";
import { purposeRepository } from "../src/repositories/purpose.repository.js";
import { purposeServiceBuilder } from "../src/services/purpose.service.js";
import { PurposeEntity } from "../src/models/domain/model.js";
import { toPurposeV1Entity } from "../src/handlers/index.js";
import { writeAPurposeEntity } from "./databaseUtils.js";
export const { postgresDB } = setupTestContainersVitest(
  inject("signalHubStoreConfig")
);

export const purposeService = purposeServiceBuilder(
  purposeRepository(postgresDB)
);

export const incrementVersion = (version: number = 0): number => version + 1;

export const generateId = (): string => randomUUID();
export function dateToBigInt(input: Date): bigint {
  return BigInt(input.getTime());
}

export const getMockPurposeV1 = (
  partialPurpose?: Partial<PurposeV1>
): PurposeV1 => ({
  id: generateId(),
  eserviceId: generateId(),
  consumerId: generateId(),
  versions: [],
  title: "This is a Purpose for testing event consuming V1",
  description: "This is a description for a test purpose",
  createdAt: dateToBigInt(new Date()),
  ...partialPurpose,
});

export const getMockPurposeVersionV1 = (
  state?: PurposeStateV1,
  partialPurposeVersion?: Partial<PurposeVersionV1>
): PurposeVersionV1 => ({
  id: generateId(),
  state: state || PurposeStateV1.DRAFT,
  dailyCalls: 10,
  createdAt: dateToBigInt(new Date()),
  ...partialPurposeVersion,
  ...(state !== PurposeStateV1.DRAFT
    ? {
        updatedAt: dateToBigInt(new Date()),
        firstActivationAt: dateToBigInt(new Date()),
      }
    : {}),
  ...(state === PurposeStateV1.SUSPENDED
    ? { suspendedAt: dateToBigInt(new Date()) }
    : {}),
  ...(state === PurposeStateV1.REJECTED ? { rejectionReason: "test" } : {}),
});

export const PurposeEventV1Type = z.union([
  z.literal("PurposeCreated"),
  z.literal("PurposeUpdated"),
  z.literal("PurposeVersionWaitedForApproval"),
  z.literal("PurposeVersionActivated"),
  z.literal("PurposeVersionSuspended"),
  z.literal("PurposeVersionArchived"),
]);
type PurposeEventV1Type = z.infer<typeof PurposeEventV1Type>;

export const PurposeVersionEventV1Type = z.union([
  z.literal("PurposeVersionCreated"),
  z.literal("PurposeVersionUpdated"),
  z.literal("PurposeVersionDeleted"),
  z.literal("PurposeVersionRejected"),
  z.literal("PurposeDeleted"),
]);
type PurposeVersionEventV1Type = z.infer<typeof PurposeVersionEventV1Type>;

export const createAPurposeEventV1 = (
  type: PurposeEventV1Type,
  purpose: PurposeV1,
  stream_id?: string,
  version?: number
): PurposeEventV1 => {
  const purposeEventV1: PurposeEventV1 = {
    type,
    data: {
      purpose,
    },
    event_version: 1,
    stream_id: stream_id || generateId(),
    version: version || 1,
    timestamp: new Date(),
  };
  return purposeEventV1;
};

export const createAPurposeVersionEventV1 = (
  type: PurposeVersionEventV1Type,
  purpose: PurposeV1,
  stream_id?: string,
  version?: number
): PurposeEventV1 => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const purposeGeneric: any = {
    type,
    event_version: 1,
    stream_id: stream_id || generateId(),
    version: version || 1,
    timestamp: new Date(),
  };
  return (
    match({ type })
      .with({ type: "PurposeVersionRejected" }, () => ({
        ...purposeGeneric,
        data: {
          purpose,
          versionId: purpose.versions[0].id,
        },
      }))
      .with({ type: "PurposeDeleted" }, () => ({
        ...purposeGeneric,
        data: {
          purposeId: purpose.id,
        },
      }))
      .with({ type: "PurposeVersionDeleted" }, () => ({
        ...purposeGeneric,
        data: {
          purposeId: purpose.id,
          versionId: purpose.versions[0].id,
        },
      }))
      .with({ type: "PurposeVersionUpdated" }, () => ({
        ...purposeGeneric,
        data: {
          purposeId: purpose.id,
          version: purpose.versions[0],
        },
      }))
      // eslint-disable-next-line sonarjs/no-identical-functions
      .with({ type: "PurposeVersionCreated" }, () => ({
        ...purposeGeneric,
        data: {
          purposeId: purpose.id,
          version: purpose.versions[0],
        },
      }))
      .exhaustive()
  );
};

export async function createAndWriteAPurposeEventV1(
  purposeV1: PurposeV1,
  streamId: string,
  version: number,
  type: PurposeEventV1Type = "PurposeVersionActivated"
): Promise<{
  purposeV1: PurposeV1;
  purposeEventV1: PurposeEventV1;
}> {
  const purposeEventV1 = createAPurposeEventV1(
    type,
    purposeV1,
    streamId,
    version
  );
  await writeAPurposeEntity(toPurposeV1Entity(purposeEventV1, purposeV1));
  return { purposeV1, purposeEventV1 };
}

export const fromEventToEntity = (
  purpose: PurposeV1 | PurposeV2,
  version: PurposeVersionV1,
  event: PurposeEventV1 | PurposeEventV2
): PurposeEntity => ({
  purposeId: purpose.id,
  purposeVersionId: version.id,
  purposeState: version.state.toString(),
  eserviceId: purpose.eserviceId,
  consumerId: purpose.consumerId,
  eventStreamId: event.stream_id,
  eventVersionId: event.version,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toPurposeEntity = (purpose: any): PurposeEntity => ({
  purposeId: purpose.purpose_id,
  purposeVersionId: purpose.purpose_version_id,
  purposeState: purpose.purpose_state,
  eserviceId: purpose.eservice_id,
  consumerId: purpose.consumer_id,
  eventStreamId: purpose.event_stream_id,
  eventVersionId: Number(purpose.event_version_id),
});
