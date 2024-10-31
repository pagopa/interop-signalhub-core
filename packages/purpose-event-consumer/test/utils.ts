import {
  PurposeEventV1,
  PurposeEventV2,
  PurposeStateV1,
  PurposeStateV2,
  PurposeV1,
  PurposeV2,
  PurposeVersionV1,
  PurposeVersionV2
} from "@pagopa/interop-outbound-models";
import { randomUUID } from "crypto";
import { setupTestContainersVitest } from "pagopa-signalhub-commons-test";
import { P, match } from "ts-pattern";
import { inject } from "vitest";
import { z } from "zod";

import { toPurposeV1Entity, toPurposeV2Entity } from "../src/handlers/index.js";
import { PurposeEntity } from "../src/models/domain/model.js";
import { purposeRepository } from "../src/repositories/purpose.repository.js";
import { purposeServiceBuilder } from "../src/services/purpose.service.js";
import { writeAPurposeEntity } from "./databaseUtils.js";
export const { postgresDB } = setupTestContainersVitest(
  inject("signalHubStoreConfig")
);

export const purposeService = purposeServiceBuilder(
  purposeRepository(postgresDB)
);

export const incrementVersion = (version = 0): number => version + 1;

export const generateId = (): string => randomUUID();
export function dateToBigInt(input: Date): bigint {
  return BigInt(input.getTime());
}

export const getMockPurpose = (
  partialPurpose?: Partial<PurposeV1> | Partial<PurposeV2>
): PurposeV1 | PurposeV2 => ({
  id: generateId(),
  eserviceId: generateId(),
  consumerId: generateId(),
  versions: [],
  title: "This is a Purpose for testing event consuming V1",
  description: "This is a description for a test purpose",
  createdAt: dateToBigInt(new Date()),
  isFreeOfCharge: false,
  ...partialPurpose
});

export const getMockPurposeVersion = (
  state?: PurposeStateV1 | PurposeStateV2,
  partialPurposeVersion?: Partial<PurposeVersionV1> | Partial<PurposeVersionV2>
): PurposeVersionV1 | PurposeVersionV2 => ({
  id: generateId(),
  state: state || PurposeStateV1.DRAFT,
  dailyCalls: 10,
  createdAt: dateToBigInt(new Date()),
  ...partialPurposeVersion,
  ...(state !== PurposeStateV1.DRAFT
    ? {
        updatedAt: dateToBigInt(new Date()),
        firstActivationAt: dateToBigInt(new Date())
      }
    : {}),
  ...(state === PurposeStateV1.SUSPENDED
    ? { suspendedAt: dateToBigInt(new Date()) }
    : {}),
  ...(state === PurposeStateV1.REJECTED ? { rejectionReason: "test" } : {})
});

export const PurposeEventV1Type = z.union([
  z.literal("PurposeCreated"),
  z.literal("PurposeUpdated"),
  z.literal("PurposeVersionWaitedForApproval"),
  z.literal("PurposeVersionActivated"),
  z.literal("PurposeVersionSuspended"),
  z.literal("PurposeVersionArchived")
]);
type PurposeEventV1Type = z.infer<typeof PurposeEventV1Type>;

export const PurposeVersionEventV1Type = z.union([
  z.literal("PurposeVersionCreated"),
  z.literal("PurposeVersionUpdated"),
  z.literal("PurposeVersionDeleted"),
  z.literal("PurposeVersionRejected"),
  z.literal("PurposeDeleted")
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
      purpose
    },
    event_version: 1,
    stream_id: stream_id || generateId(),
    version: version || 1,
    timestamp: new Date()
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
    timestamp: new Date()
  };
  return match({ type })
    .with({ type: "PurposeVersionRejected" }, () => ({
      ...purposeGeneric,
      data: {
        purpose,
        versionId: purpose.versions[0].id
      }
    }))
    .with({ type: "PurposeDeleted" }, () => ({
      ...purposeGeneric,
      data: {
        purposeId: purpose.id
      }
    }))
    .with({ type: "PurposeVersionDeleted" }, () => ({
      ...purposeGeneric,
      data: {
        purposeId: purpose.id,
        versionId: purpose.versions[0].id
      }
    }))
    .with({ type: "PurposeVersionUpdated" }, () => ({
      ...purposeGeneric,
      data: {
        purposeId: purpose.id,
        version: purpose.versions[0]
      }
    }))
    .with({ type: "PurposeVersionCreated" }, () => ({
      ...purposeGeneric,
      data: {
        purposeId: purpose.id,
        version: purpose.versions[0]
      }
    }))
    .exhaustive();
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

export const PurposeEventV2Type = z.union([
  z.literal("PurposeAdded"),
  z.literal("DraftPurposeUpdated"),
  z.literal("PurposeWaitingForApproval"),
  z.literal("PurposeActivated"),
  z.literal("DraftPurposeDeleted"),
  z.literal("WaitingForApprovalPurposeDeleted")
]);
type PurposeEventV2Type = z.infer<typeof PurposeEventV2Type>;

export const PurposeVersionEventV2Type = z.union([
  z.literal("NewPurposeVersionActivated"),
  z.literal("PurposeVersionActivated"),
  z.literal("PurposeVersionUnsuspendedByProducer"),
  z.literal("PurposeVersionUnsuspendedByConsumer"),
  z.literal("PurposeVersionSuspendedByProducer"),
  z.literal("PurposeVersionSuspendedByConsumer"),
  z.literal("NewPurposeVersionWaitingForApproval"),
  z.literal("PurposeVersionOverQuotaUnsuspended"),
  z.literal("PurposeArchived"),
  z.literal("WaitingForApprovalPurposeVersionDeleted"),
  z.literal("PurposeVersionRejected"),
  z.literal("PurposeCloned")
]);
type PurposeVersionEventV2Type = z.infer<typeof PurposeVersionEventV2Type>;

export const createAPurposeEventV2 = (
  type: PurposeEventV2Type,
  purpose: PurposeV2,
  stream_id?: string,
  version?: number
): PurposeEventV2 => {
  const purposeEventV2: PurposeEventV2 = {
    type,
    data: {
      purpose
    },
    event_version: 2,
    stream_id: stream_id || generateId(),
    version: version || 1,
    timestamp: new Date()
  };
  return purposeEventV2;
};

export const createAPurposeVersionEventV2 = (
  type: PurposeVersionEventV2Type,
  purpose: PurposeV2,
  stream_id?: string,
  version?: number
): PurposeEventV2 => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const purposeGeneric: any = {
    type,
    event_version: 2,
    stream_id: stream_id || generateId(),
    version: version || 1,
    timestamp: new Date()
  };
  return match({ type })
    .with(
      {
        type: P.union(
          "NewPurposeVersionActivated",
          "PurposeVersionActivated",
          "PurposeVersionUnsuspendedByProducer",
          "PurposeVersionUnsuspendedByConsumer",
          "PurposeVersionSuspendedByProducer",
          "PurposeVersionSuspendedByConsumer",
          "NewPurposeVersionWaitingForApproval",
          "PurposeVersionOverQuotaUnsuspended",
          "PurposeArchived",
          "WaitingForApprovalPurposeVersionDeleted",
          "PurposeVersionRejected"
        )
      },
      () => ({
        ...purposeGeneric,
        data: {
          purpose,
          versionId: purpose.versions[0].id
        }
      })
    )
    .with({ type: "PurposeCloned" }, () => ({
      ...purposeGeneric,
      data: {
        purposeId: purpose.id,
        version: purpose.versions[0],
        sourcePurposeId: purpose.id
      }
    }))
    .exhaustive();
};

export async function createAndWriteAPurposeEventV2(
  purposeV2: PurposeV2,
  streamId: string,
  version: number,
  type: PurposeEventV2Type = "PurposeActivated"
): Promise<{
  purposeV2: PurposeV2;
  purposeEventV2: PurposeEventV2;
}> {
  const purposeEventV2 = createAPurposeEventV2(
    type,
    purposeV2,
    streamId,
    version
  );
  await writeAPurposeEntity(toPurposeV2Entity(purposeEventV2, purposeV2));
  return { purposeV2, purposeEventV2 };
}

export const fromEventToEntity = (
  purpose: PurposeV1 | PurposeV2,
  version: PurposeVersionV1 | PurposeVersionV2,
  event: PurposeEventV1 | PurposeEventV2
): PurposeEntity => ({
  purposeId: purpose.id,
  purposeVersionId: version.id,
  purposeState: getPurposeState(event, version),
  eserviceId: purpose.eserviceId,
  consumerId: purpose.consumerId,
  eventStreamId: event.stream_id,
  eventVersionId: event.version
});

const getPurposeState = (
  event: PurposeEventV1 | PurposeEventV2,
  version: PurposeVersionV1 | PurposeVersionV2
): string =>
  match(event)
    .with({ event_version: 1 }, () => PurposeStateV1[version.state])
    .with({ event_version: 2 }, () => PurposeStateV2[version.state])
    .exhaustive();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toPurposeEntity = (purpose: any): PurposeEntity => ({
  purposeId: purpose.purpose_id,
  purposeVersionId: purpose.purpose_version_id,
  purposeState: purpose.purpose_state,
  eserviceId: purpose.eservice_id,
  consumerId: purpose.consumer_id,
  eventStreamId: purpose.event_stream_id,
  eventVersionId: Number(purpose.event_version_id)
});
