import { inject } from "vitest";
import { setupTestContainersVitest } from "pagopa-signalhub-commons-test";
import { eServiceServiceBuilder } from "../src/services/eservice.service.js";
import { eServiceRepository } from "../src/repositories/eservice.repository.js";
import { eServiceProducerRepository } from "../src/repositories/eServiceProducer.repository.js";
import { randomUUID } from "crypto";
import {
  AgreementApprovalPolicyV2,
  EServiceDescriptorStateV1,
  EServiceDescriptorStateV2,
  EServiceDescriptorV1,
  EServiceDescriptorV2,
  EServiceEventV1,
  EServiceEventV2,
  EServiceModeV1,
  EServiceModeV2,
  EServiceTechnologyV1,
  EServiceTechnologyV2,
  EServiceV1,
  EServiceV2,
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

export const getDescriptorV2 = (
  partialDescriptorV2?: Partial<EServiceDescriptorV2>
): EServiceDescriptorV2 => ({
  id: generateID(),
  agreementApprovalPolicy: AgreementApprovalPolicyV2.AUTOMATIC,
  audience: ["test.audience"],
  createdAt: 1n,
  dailyCallsPerConsumer: 100,
  dailyCallsTotal: 100,
  docs: [],
  serverUrls: ["http://test.com"],
  state: EServiceDescriptorStateV2.DRAFT,
  version: 1n,
  voucherLifespan: 100,
  ...partialDescriptorV2,
});

export const createEserviceDescriptorV1 = (
  partialEserviceDescriptorV1?: Partial<EServiceDescriptorV1>
): EServiceDescriptorV1 => ({
  ...descriptor,
  ...partialEserviceDescriptorV1,
});

export const createEServiceV1 = (
  partialEservice?: Partial<EServiceV1>,
  descriptorItem?: EServiceDescriptorV1
): EServiceV1 => ({
  id: generateID(),
  producerId: generateID(),
  description: "eService test description",
  name: "eServie test name",
  mode: EServiceModeV1.RECEIVE,
  technology: EServiceTechnologyV1.REST,
  ...partialEservice,
  descriptors: [descriptorItem || descriptor],
});

export const createEServiceV2 = (
  partialEService?: Partial<EServiceV2>,
  descriptorsItem?: EServiceDescriptorV2
): EServiceV2 => ({
  id: generateID(),
  producerId: generateID(),
  descriptors: descriptorsItem ? [descriptorsItem] : [],
  createdAt: 1 as any,
  description: "eService test description",
  name: "eService test name",
  mode: EServiceModeV2.RECEIVE,
  technology: EServiceTechnologyV2.REST,
  ...partialEService,
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

export const createEserviceDescriptorUpdatedEventV1 = (
  eServiceId: string,
  descriptor: EServiceDescriptorV1 | undefined,
  stream_id?: string,
  version?: number
): EServiceEventV1 => {
  return {
    type: "EServiceDescriptorUpdated",
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

export const createEServiceWithDescriptorsDeletedEventV1 = (
  eserviceV1: EServiceV1,
  stream_id?: string,
  version?: number
): EServiceEventV1 => {
  return {
    type: "EServiceWithDescriptorsDeleted",
    event_version: 1,
    stream_id: stream_id || generateID(),
    timestamp: new Date(),
    version: version || 1,
    data: {
      descriptorId: eserviceV1.descriptors[0].id,
      eservice: eserviceV1,
    },
  };
};

export const createEserviceAddedEventV2 = (
  eServiceV2: EServiceV2,
  stream_id?: string,
  version?: number
): EServiceEventV2 => {
  return {
    type: "EServiceAdded",
    event_version: 2,
    stream_id: stream_id || generateID(),
    timestamp: new Date(),
    version: version || 1,
    data: {
      eservice: eServiceV2,
    },
  };
};
