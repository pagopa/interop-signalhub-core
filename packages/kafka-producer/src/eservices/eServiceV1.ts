import {
  EServiceAddedV1,
  EServiceDescriptorStateV1,
  EServiceEvent,
} from "@pagopa/interop-outbound-models";
import { randomUUID } from "crypto";
import { match } from "ts-pattern";
import { z } from "zod";

const randomID = randomUUID();

const eServiceAddedV1: EServiceAddedV1 = {
  eservice: {
    description: "",
    descriptors: [],
    id: randomID,
    name: "Eservice-test",
    producerId: randomID,
    technology: 1,
  },
};

const eServiceAddedEvent: EServiceEvent = {
  event_version: 1,
  type: "EServiceAdded",
  data: eServiceAddedV1,
  stream_id: "1",
  version: 1,
  timestamp: new Date(),
};

const eServiceDescriptorAdded: EServiceEvent = {
  event_version: 1,
  type: "EServiceDescriptorAdded",
  timestamp: new Date(),
  stream_id: "1",
  version: 2,
  data: {
    eserviceId: randomID,
    eserviceDescriptor: {
      id: randomID,
      audience: [],
      serverUrls: [],
      version: "2",
      state: EServiceDescriptorStateV1.PUBLISHED,
      dailyCallsTotal: 10,
      dailyCallsPerConsumer: 10,
      docs: [],
      voucherLifespan: 10,
    },
  },
};

export const EserviceEventType = z.union([
  z.literal("EServiceAdded"),
  z.literal("EServiceDescriptorAdded"),
]);
export type EserviceEventType = z.infer<typeof EserviceEventType>;

export function getEserviceEventV1ByType(
  type: EserviceEventType
): EServiceEvent {
  return match(type)
    .with("EServiceAdded", () => eServiceAddedEvent)
    .with("EServiceDescriptorAdded", () => eServiceDescriptorAdded)
    .exhaustive();
}
