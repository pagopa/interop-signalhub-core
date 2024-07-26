import { randomUUID } from "crypto";
import { AgreementEvent, AgreementV1 } from "pagopa-interop-outbound-models";
import { match } from "ts-pattern";
import { z } from "zod";

const randomID = randomUUID();

const agreementV1: AgreementV1 = {
  certifiedAttributes: [],
  consumerDocuments: [],
  declaredAttributes: [],
  verifiedAttributes: [],
  consumerId: randomID,
  descriptorId: randomID,
  eserviceId: randomID,
  id: randomID,
  producerId: randomID,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: 1 as any,
  state: 4,
};

const agreementDeletedEventV1: AgreementEvent = {
  event_version: 1,
  type: "AgreementDeleted",
  data: {
    agreementId: "123",
  },
  stream_id: "123",
  timestamp: new Date(),
  version: 1,
};

const agreementActivatedV1: AgreementEvent = {
  event_version: 1,
  type: "AgreementActivated",
  data: {
    agreement: agreementV1,
  },
  stream_id: "123",
  timestamp: new Date(),
  version: 1,
};

const agreementAddedV1: AgreementEvent = {
  event_version: 1,
  type: "AgreementAdded",
  data: {
    agreement: agreementV1,
  },
  stream_id: "123",
  timestamp: new Date(),
  version: 1,
};

const agreementSuspendedV1: AgreementEvent = {
  event_version: 1,
  type: "AgreementSuspended",
  data: {
    agreement: agreementV1,
  },
  stream_id: "123",
  timestamp: new Date(),
  version: 1,
};

const agreementUpdatedV1: AgreementEvent = {
  event_version: 1,
  type: "AgreementUpdated",
  data: {
    agreement: agreementV1,
  },
  stream_id: "123",
  timestamp: new Date(),
  version: 1,
};

export const AgreementEventType = z.union([
  z.literal("AgreementDeleted"),
  z.literal("AgreementActivated"),
  z.literal("AgreementAdded"),
  z.literal("AgreementSuspended"),
  z.literal("AgreementUpdated"),
]);

export type AgreementEventType = z.infer<typeof AgreementEventType>;

export function getAgreementV1ByType(type: AgreementEventType): AgreementEvent {
  return match(type)
    .with("AgreementActivated", () => agreementActivatedV1)
    .with("AgreementAdded", () => agreementAddedV1)
    .with("AgreementSuspended", () => agreementSuspendedV1)
    .with("AgreementUpdated", () => agreementUpdatedV1)
    .with("AgreementDeleted", () => agreementDeletedEventV1)
    .exhaustive();
}
