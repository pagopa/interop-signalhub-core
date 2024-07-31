import { randomUUID } from "crypto";
import { setupTestContainersVitest } from "pagopa-signalhub-commons-test";
import { inject } from "vitest";
import {
  AgreementEventV1,
  AgreementStateV1,
  AgreementV1,
} from "@pagopa/interop-outbound-models";
import { agreementRepository } from "../src/repositories/index.js";
import { agreementServiceBuilder } from "../src/services/index.js";
import { AgreementEntity } from "../src/models/domain/model.js";
import { writeAnAgreement } from "./databaseUtils.js";

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

export const createAnAgreement = (
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

export const createAPartialEventAgreement = (
  partialAgreementEvent?: Partial<AgreementEventV1>
): Partial<AgreementEventV1> => ({
  event_version: 1,
  stream_id: generateID(),
  version: 1,
  timestamp: new Date(),

  ...partialAgreementEvent,
});

export const createAnEventAgreementAdded = (
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

export const createAnEventAgreementUpdated = (
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

export const createAnEventAgreementActivated = (
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

export const createAnEventAgreementDeleted = (
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

export async function writeAnAgreementOnDatabase(
  partialAgreement: Partial<AgreementV1>,
  streamId: string,
  version: number
): Promise<{
  agreementV1: AgreementV1;
  agreementEventAddedV1: AgreementEventV1;
}> {
  const agreementV1 = createAnAgreement(partialAgreement);
  const agreementEventAddedV1 = createAnEventAgreementAdded(
    agreementV1,
    streamId,
    version
  );
  await writeAnAgreement(toAgreementEntity(agreementV1, agreementEventAddedV1));
  return { agreementV1, agreementEventAddedV1 };
}

export const toAgreementEntity = (
  agreement: AgreementV1,
  event: AgreementEventV1
): AgreementEntity => ({
  agreement_id: agreement.id,
  eservice_id: agreement.eserviceId,
  descriptor_id: agreement.descriptorId,
  consumer_id: agreement.consumerId,
  state: agreement.state.toString(),
  event_stream_id: event.stream_id,
  event_version_id: event.version,
  event_id: -1,
  tmst_insert: null, // bigIntToDate(agreement.createdAt)?.toISOString(),
  tmst_last_edit: null,
});
