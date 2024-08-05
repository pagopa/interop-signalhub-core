import { inject } from "vitest";
import { setupTestContainersVitest } from "pagopa-signalhub-commons-test";
import { eServiceServiceBuilder } from "../src/services/eservice.service.js";
import { eServiceRepository } from "../src/repositories/eservice.repository.js";
import { eServiceProducerRepository } from "../src/repositories/eServiceProducer.repository.js";
import { randomUUID } from "crypto";
import {
  EServiceDescriptorStateV1,
  EServiceDescriptorV1,
  EServiceEventV1,
  EServiceModeV1,
  EServiceTechnologyV1,
  EServiceV1,
} from "@pagopa/interop-outbound-models";

export const { postgresDB } = setupTestContainersVitest(
  inject("signalHubStoreConfig")
);

const eServiceRepositoryInstance = eServiceRepository(postgresDB);
const producerEserviceRepositoryInstance =
  eServiceProducerRepository(postgresDB);

export const eServiceService = eServiceServiceBuilder(
  eServiceRepositoryInstance,
  producerEserviceRepositoryInstance
);

export const generateID = (): string => randomUUID();

const descriptor: EServiceDescriptorV1 = {
  id: generateID(),
  audience: ["test.audience"],
  dailyCallsPerConsumer: 100,
  dailyCallsTotal: 100,
  state: EServiceDescriptorStateV1.PUBLISHED,
  version: "1",
  voucherLifespan: 100,
  serverUrls: ["http://test.com"],
  docs: [],
};

export const createEserviceDescriptorV1 = (
  partialEserviceDescriptorV1?: Partial<EServiceDescriptorV1>
): EServiceDescriptorV1 => ({
  ...descriptor,
  ...partialEserviceDescriptorV1,
});

export const createEserviceV1 = (
  partialEservice?: Partial<EServiceV1>
): EServiceV1 => ({
  id: generateID(),
  producerId: generateID(),
  description: "eService test description",
  name: "eServie test name",
  mode: EServiceModeV1.RECEIVE,
  technology: EServiceTechnologyV1.REST,
  ...partialEservice,
  descriptors: [descriptor],
});

export const createEserviceAddedEventV1 = (
  eserviceV1: EServiceV1 | undefined,
  stream_id?: string,
  version?: number
): EServiceEventV1 => {
  return {
    type: "EServiceAdded",
    timestamp: new Date(),
    event_version: 1,
    version: version || 1,
    stream_id: stream_id || generateID(),
    data: {
      eservice: eserviceV1,
    },
  };
};

export const createEserviceDescriptorAddedEventV1 = (
  eServiceId: string,
  descriptor: EServiceDescriptorV1 | undefined,
  stream_id?: string,
  version?: number
): EServiceEventV1 => {
  return {
    type: "EServiceDescriptorAdded",
    event_version: 1,
    stream_id: stream_id || generateID(),
    timestamp: new Date(),
    version: version || 1,
    data: {
      eserviceId: eServiceId,
      eserviceDescriptor: descriptor,
    },
  };
};
