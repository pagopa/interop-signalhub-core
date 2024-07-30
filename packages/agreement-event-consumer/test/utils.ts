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

export const { postgresDB } = setupTestContainersVitest(
  inject("signalHubStoreConfig")
);

export const agreementService = agreementServiceBuilder(
  agreementRepository(postgresDB)
);

export const createAnAgreement = (
  partialAgreement?: Partial<AgreementV1>
): AgreementV1 => ({
  id: randomUUID(),
  eserviceId: randomUUID(),
  descriptorId: randomUUID(),
  state: AgreementStateV1.ACTIVE,
  producerId: randomUUID(),
  consumerId: randomUUID(),
  certifiedAttributes: [],
  consumerDocuments: [],
  declaredAttributes: [],
  verifiedAttributes: [],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: 1 as any,

  ...partialAgreement,
});

export const createAPartialEventAgreement = (
  partialAgreementEvent?: Partial<AgreementEventV1>
): Partial<AgreementEventV1> => ({
  event_version: 1,
  stream_id: randomUUID(),
  version: 1,
  timestamp: new Date(),

  ...partialAgreementEvent,
});

export const createAnEventAgreement = (
  agreement: AgreementV1,
  stream_id: string,
  version: number
): AgreementEventV1 => {
  const agreementEventAddedV1: AgreementEventV1 = {
    event_version: 1,
    type: "AgreementAdded",
    data: {
      agreement,
    },
    stream_id,
    version,
    timestamp: new Date(),
  };
  return agreementEventAddedV1;
};

export const getAnAgreementBy = async (
  agreementId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> =>
  await postgresDB.one(
    "SELECT * FROM dev_interop.agreement a WHERE a.agreement_id = $1",
    [agreementId]
  );
