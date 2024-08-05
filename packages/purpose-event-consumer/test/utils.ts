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
import { purposeRepository } from "../src/repositories/purpose.repository.js";
import { purposeServiceBuilder } from "../src/services/purpose.service.js";
import { PurposeEntity } from "../src/models/domain/model.js";
export const { postgresDB } = setupTestContainersVitest(
  inject("signalHubStoreConfig")
);

export const purposeService = purposeServiceBuilder(
  purposeRepository(postgresDB)
);

export const incrementVersion = (version: number): number => version + 1;

export const generateId = (): string => randomUUID();
export function bigIntToDate(input: bigint): Date {
  return new Date(Number(input));
}
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

export const createAPurposeCreatedEventV1 = (
  purpose: PurposeV1,
  stream_id?: string,
  version?: number
): PurposeEventV1 => {
  const purposeEventAddedV1: PurposeEventV1 = {
    type: "PurposeCreated",
    data: {
      purpose,
    },
    event_version: 1,
    stream_id: stream_id || generateId(),
    version: version || 1,
    timestamp: new Date(),
  };
  return purposeEventAddedV1;
};

export const fromEventToEntity = (
  purpose: PurposeV1 | PurposeV2,
  event: PurposeEventV1 | PurposeEventV2
): PurposeEntity => ({
  purposeId: purpose.id,
  purposeVersionId: purpose.versions[0].id,
  purposeState: purpose.versions[0].state.toString(),
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
