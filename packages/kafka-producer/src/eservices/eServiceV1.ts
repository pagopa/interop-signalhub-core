import {
  EServiceAddedV1,
  EServiceDescriptorStateV1,
  EServiceDescriptorV1,
  EServiceEvent,
  EServiceEventV1,
  EServiceTechnologyV1,
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

const descriptor: EServiceDescriptorV1 = {
  id: randomID,
  audience: [],
  serverUrls: [],
  version: "1",
  state: EServiceDescriptorStateV1.PUBLISHED,
  dailyCallsTotal: 10,
  dailyCallsPerConsumer: 10,
  docs: [],
  voucherLifespan: 10,
};

const eServiceDescriptorAdded: EServiceEvent = {
  event_version: 1,
  type: "EServiceDescriptorAdded",
  timestamp: new Date(),
  stream_id: "1",
  version: 2,
  data: {
    eserviceId: randomID,
    eserviceDescriptor: descriptor,
  },
};

const EserviceUpdated: EServiceEventV1 = {
  event_version: 1,
  version: 1,
  type: "EServiceUpdated",
  timestamp: new Date(),
  stream_id: "1",
  data: {
    eservice: {
      description: "",
      technology: EServiceTechnologyV1.REST,
      id: randomID,
      name: "",
      producerId: randomID,
      descriptors: [descriptor, descriptor],
    },
  },
};

export const EserviceEventType = z.union([
  z.literal("EServiceAdded"),
  z.literal("EServiceDescriptorAdded"),
  z.literal("EServiceUpdated"),
]);
export type EserviceEventType = z.infer<typeof EserviceEventType>;

export function getEserviceEventV1ByType(
  type: EserviceEventType
): EServiceEvent {
  return match(type)
    .with("EServiceAdded", () => eServiceAddedEvent)
    .with("EServiceDescriptorAdded", () => eServiceDescriptorAdded)
    .with("EServiceUpdated", () => EserviceUpdated)
    .exhaustive();
}
