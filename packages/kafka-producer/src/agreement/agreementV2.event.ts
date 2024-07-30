import { randomUUID } from "crypto";
import { AgreementEvent, AgreementV2 } from "@pagopa/interop-outbound-models";
import { match } from "ts-pattern";
import { z } from "zod";

const randomID = randomUUID();

const agreementV2: AgreementV2 = {
  certifiedAttributes: [],
  consumerDocuments: [],
  declaredAttributes: [],
  verifiedAttributes: [],
  consumerId: randomID,
  descriptorId: randomID,
  eserviceId: randomID,
  id: randomID,
  producerId: randomID,
  createdAt: 1 as any,
  state: 4,
};

// --- V2 --- //

const agreementDeletedV2: AgreementEvent = {
  event_version: 2,
  type: "AgreementDeleted",
  data: {
    agreement: agreementV2,
  },
  stream_id: "123",
  timestamp: new Date(),
  version: 1,
};

const agreementActivatedV2: AgreementEvent = {
  event_version: 2,
  type: "AgreementActivated",
  data: {
    agreement: agreementV2,
  },
  stream_id: "123",
  timestamp: new Date(),
  version: 1,
};

const agreementAddedV2: AgreementEvent = {
  event_version: 2,
  type: "AgreementAdded",
  data: {
    agreement: agreementV2,
  },
  stream_id: "123",
  timestamp: new Date(),
  version: 1,
};

const agreementUpdatedV2: AgreementEvent = {
  event_version: 2,
  type: "AgreementUpgraded",
  data: {
    agreement: agreementV2,
  },
  stream_id: "123",
  timestamp: new Date(),
  version: 1,
};

const agreementSuspensionV2: AgreementEvent = {
  event_version: 2,
  type: "AgreementSuspendedByPlatform",
  data: {
    agreement: agreementV2,
  },
  stream_id: "123",
  timestamp: new Date(),
  version: 1,
};

export const AgreementEventV2Type = z.union([
  z.literal("AgreementDeleted"),
  z.literal("AgreementActivated"),
  z.literal("AgreementAdded"),
  z.literal("AgreementUpgraded"),
  z.literal("AgreementSuspendedByPlatform"),
]);

export type AgreementEventV2Type = z.infer<typeof AgreementEventV2Type>;

export function getAgreementV2ByType(
  type: AgreementEventV2Type
): AgreementEvent {
  return match(type)
    .with("AgreementActivated", () => agreementActivatedV2)
    .with("AgreementAdded", () => agreementAddedV2)
    .with("AgreementSuspendedByPlatform", () => agreementSuspensionV2)
    .with("AgreementUpgraded", () => agreementUpdatedV2)
    .with("AgreementDeleted", () => agreementDeletedV2)
    .exhaustive();
}
