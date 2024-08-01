import { randomUUID } from "crypto";
import { setupTestContainersVitest } from "pagopa-signalhub-commons-test";
import { inject } from "vitest";
import {
  AgreementEventV1,
  AgreementEventV2,
  AgreementStateV1,
  AgreementStateV2,
  AgreementV1,
  AgreementV2,
} from "@pagopa/interop-outbound-models";
import { z } from "zod";
import { agreementRepository } from "../src/repositories/index.js";
import { agreementServiceBuilder } from "../src/services/index.js";
import { AgreementEntity } from "../src/models/domain/model.js";
import { writeAnAgreementEntity } from "./databaseUtils.js";

export const { postgresDB } = setupTestContainersVitest(
  inject("signalHubStoreConfig")
);

export const agreementService = agreementServiceBuilder(
  agreementRepository(postgresDB)
);

export const incrementVersion = (version: number): number => version + 1;

export const generateID = (): string => randomUUID();
export function bigIntToDate(input: bigint | undefined): Date | undefined {
  return input ? new Date(Number(input)) : undefined;
}

export const createAnAgreementV1 = (
  partialAgreement?: Partial<AgreementV1>
): AgreementV1 => ({
  id: generateID(),
  eserviceId: generateID(),
  descriptorId: generateID(),
  state: AgreementStateV1.ACTIVE,
  producerId: generateID(),
  consumerId: generateID(),
  certifiedAttributes: [],
  consumerDocuments: [],
  declaredAttributes: [],
  verifiedAttributes: [],
  createdAt: BigInt(new Date().getTime()),

  ...partialAgreement,
});

export const createAnAgreementAddedEventV1 = (
  agreement: AgreementV1,
  stream_id?: string,
  version?: number
): AgreementEventV1 => {
  const agreementEventAddedV1: AgreementEventV1 = {
    type: "AgreementAdded",
    data: {
      agreement,
    },
    event_version: 1,
    stream_id: stream_id || generateID(),
    version: version || 1,
    timestamp: new Date(),
  };
  return agreementEventAddedV1;
};

export const createAnAgreementUpdatedEventV1 = (
  agreement: AgreementV1,
  stream_id: string,
  version?: number
): AgreementEventV1 => {
  const agreementEventAddedV1: AgreementEventV1 = {
    type: "AgreementUpdated",
    data: {
      agreement,
    },
    event_version: 1,
    stream_id,
    version: version || 1,
    timestamp: new Date(),
  };
  return agreementEventAddedV1;
};

export const createAnAgreementContractAddedEventV1 = (
  agreement: AgreementV1,
  stream_id?: string,
  version?: number
): AgreementEventV1 => {
  const agreementEventAddedV1: AgreementEventV1 = {
    type: "AgreementContractAdded",
    data: {
      agreementId: agreement.id,
      contract: undefined,
    },
    event_version: 1,
    stream_id: stream_id || generateID(),
    version: version || 1,
    timestamp: new Date(),
  };
  return agreementEventAddedV1;
};

export const createAnAgreementActivatedEventV1 = (
  agreement: AgreementV1,
  stream_id: string,
  version?: number
): AgreementEventV1 => {
  const agreementEventAddedV1: AgreementEventV1 = {
    type: "AgreementActivated",
    data: {
      agreement,
    },
    event_version: 1,
    stream_id,
    version: version || 1,
    timestamp: new Date(),
  };
  return agreementEventAddedV1;
};

export const createAnAgreementDeletedEventV1 = (
  agreement: AgreementV1,
  stream_id: string,
  version?: number
): AgreementEventV1 => {
  const agreementEventAddedV1: AgreementEventV1 = {
    type: "AgreementDeleted",
    data: {
      agreementId: agreement.id,
    },
    event_version: 1,
    stream_id,
    version: version || 1,
    timestamp: new Date(),
  };
  return agreementEventAddedV1;
};

export async function createAndWriteAnAgreementEventV1(
  partialAgreement: Partial<AgreementV1>,
  streamId: string,
  version: number
): Promise<{
  agreementV1: AgreementV1;
  agreementAddedEventV1: AgreementEventV1;
}> {
  const agreementV1 = createAnAgreementV1(partialAgreement);
  const agreementAddedEventV1 = createAnAgreementAddedEventV1(
    agreementV1,
    streamId,
    version
  );
  await writeAnAgreementEntity(
    fromEventToEntity(agreementV1, agreementAddedEventV1)
  );
  return { agreementV1, agreementAddedEventV1 };
}

export const AgreementEventV2Type = z.union([
  z.literal("AgreementAdded"),
  z.literal("AgreementActivated"),
  z.literal("AgreementArchivedByConsumer"),
  z.literal("AgreementArchivedByUpgrade"),
  z.literal("AgreementSetDraftByPlatform"), // ??
  z.literal("AgreementSetMissingCertifiedAttributesByPlatform"), // ??
  z.literal("AgreementSuspendedByConsumer"),
  z.literal("AgreementSuspendedByProducer"),
  z.literal("AgreementSuspendedByPlatform"),
  z.literal("AgreementUnsuspendedByConsumer"),
  z.literal("AgreementUnsuspendedByProducer"),
  z.literal("AgreementUnsuspendedByPlatform"),
  z.literal("AgreementUpgraded"),
  z.literal("AgreementRejected"),
  z.literal("DraftAgreementUpdated"),
  z.literal("AgreementSubmitted"),
  z.literal("AgreementDeleted"),
]);
type AgreementEventV2Type = z.infer<typeof AgreementEventV2Type>;

export const createAnAgreementEventV2 = (
  type: AgreementEventV2Type,
  agreement: AgreementV2,
  stream_id: string,
  version?: number
): AgreementEventV2 => {
  const agreementEventV2: AgreementEventV2 = {
    type,
    data: {
      agreement,
    },
    event_version: 2,
    stream_id,
    version: version || 1,
    timestamp: new Date(),
  };
  return agreementEventV2;
};

export const createAnAgreementV2 = (
  partialAgreement?: Partial<AgreementV2>
): AgreementV2 => ({
  id: generateID(),
  eserviceId: generateID(),
  descriptorId: generateID(),
  state: AgreementStateV2.ACTIVE,
  producerId: generateID(),
  consumerId: generateID(),
  certifiedAttributes: [],
  consumerDocuments: [],
  declaredAttributes: [],
  verifiedAttributes: [],
  createdAt: BigInt(new Date().getTime()),

  ...partialAgreement,
});

export const createAnAgreementConsumerDocumentAddedEventV2 = (
  agreement: AgreementV2,
  stream_id: string,
  version?: number
): AgreementEventV2 => {
  const agreementEventV2: AgreementEventV2 = {
    type: "AgreementConsumerDocumentAdded",
    data: {
      agreement,
      documentId: generateID(),
    },
    event_version: 2,
    stream_id,
    version: version || 1,
    timestamp: new Date(),
  };
  return agreementEventV2;
};

export async function createAndWriteAnAgreementEventV2(
  partialAgreement: Partial<AgreementV2>,
  streamId: string,
  version: number
): Promise<{
  agreementV2: AgreementV2;
  agreementEventV2: AgreementEventV2;
}> {
  const agreementV2 = createAnAgreementV2(partialAgreement);
  const agreementEventV2 = createAnAgreementEventV2(
    "AgreementAdded",
    agreementV2,
    streamId,
    version
  );
  await writeAnAgreementEntity(
    fromEventToEntity(agreementV2, agreementEventV2)
  );
  return { agreementV2, agreementEventV2 };
}

export const fromEventToEntity = (
  agreement: AgreementV1 | AgreementV2,
  event: AgreementEventV1 | AgreementEventV2
): AgreementEntity => ({
  agreement_id: agreement.id,
  eservice_id: agreement.eserviceId,
  descriptor_id: agreement.descriptorId,
  consumer_id: agreement.consumerId,
  state: agreement.state.toString(),
  event_stream_id: event.stream_id,
  event_version_id: event.version,
});
