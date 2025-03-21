import { EServiceDescriptorStateV1 } from "@pagopa/interop-outbound-models";
import { genericLogger } from "pagopa-signalhub-commons";
import { beforeAll, describe, expect, it } from "vitest";

import { config } from "../src/config/env.js";
import { handleMessageV1 } from "../src/handlers/messageHandlerV1.js";
import {
  findByEserviceIdAndProducerIdAndDescriptorId,
  findProducerIdByEserviceId,
  insertEserviceDescriptor,
  insertEserviceIdAndProducerId
} from "./databaseUtils.js";
import {
  createEServiceClonedEventV1,
  createEServiceV1,
  createEServiceWithDescriptorsDeletedEventV1,
  createEserviceAddedEventV1,
  createEserviceDescriptorAddedEventV1,
  createEserviceDescriptorUpdatedEventV1,
  createEserviceDescriptorV1,
  eServiceService,
  generateID
} from "./utils.js";

describe("Message Handler for V1 EVENTS", () => {
  const producerId = "producer-test-id";
  const eServiceId = generateID();

  beforeAll(async () => {
    await insertEserviceIdAndProducerId(
      eServiceId,
      producerId,
      config.interopSchema
    );
  });

  describe("EserviceAdded Event", () => {
    it("Should add a tuple <eServiceId,producerId> for EServiceAdded event", async () => {
      const eServiceId = generateID();
      const producerId = "producer-test-id";
      const eserviceV1 = createEServiceV1({
        id: eServiceId,
        producerId,
        descriptors: []
      });

      const eServiceV1Event = createEserviceAddedEventV1(
        eserviceV1,
        generateID()
      );

      await handleMessageV1(eServiceV1Event, eServiceService, genericLogger);
      const result = await findProducerIdByEserviceId(
        eServiceId,
        config.interopSchema
      );
      expect(result?.producerId).toEqual(producerId);
    });

    it("Should throw an error if eservice data is missing", async () => {
      const eServiceV1Event = createEserviceAddedEventV1(
        undefined,
        generateID()
      );

      await expect(
        handleMessageV1(eServiceV1Event, eServiceService, genericLogger)
      ).rejects.toThrow(/Missing data in kafka message/i);
    });
  });

  describe("EserviceDescriptorAdded Event", () => {
    it("Should add an EServiceDescriptor for EServiceDescriptorAdded event", async () => {
      const descriptorId = generateID();

      const descriptor = createEserviceDescriptorV1({
        id: descriptorId,
        state: EServiceDescriptorStateV1.PUBLISHED
      });

      const eServiceV1Event = createEserviceDescriptorAddedEventV1(
        eServiceId,
        descriptor
      );

      await handleMessageV1(eServiceV1Event, eServiceService, genericLogger);
      const result = await findByEserviceIdAndProducerIdAndDescriptorId(
        eServiceId,
        descriptorId,
        producerId,
        config.interopSchema
      );

      expect(result?.eservice_id).toEqual(eServiceId);
      expect(result?.producer_id).toEqual(producerId);
      expect(result?.descriptor_id).toEqual(descriptorId);
      expect(result?.state).toEqual(
        EServiceDescriptorStateV1[EServiceDescriptorStateV1.PUBLISHED]
      );
    });

    it("Should throw an error if eserviceDescriptor data is missing", async () => {
      const eServiceV1Event = createEserviceDescriptorAddedEventV1(
        eServiceId,
        undefined
      );

      await expect(
        handleMessageV1(eServiceV1Event, eServiceService, genericLogger)
      ).rejects.toThrow(/Missing data in kafka message/i);
    });
  });

  describe("EserviceDescriptorCloned Event", () => {
    it("Should add a new record on both ESERVICE table and ESERVICE_PRODUCER table", async () => {
      const descriptorId = generateID();
      const eServiceId = generateID();

      const producerId = "new-producer-id";

      const descriptor = createEserviceDescriptorV1({
        id: descriptorId,
        state: EServiceDescriptorStateV1.PUBLISHED
      });

      const eService = createEServiceV1(
        {
          id: eServiceId,
          producerId
        },
        descriptor
      );

      const eServiceV1Event = createEServiceClonedEventV1(eService);

      await handleMessageV1(eServiceV1Event, eServiceService, genericLogger);

      const producerIdResult = await findProducerIdByEserviceId(
        eServiceId,
        config.interopSchema
      );

      // Check if ESERVICE_PRODUCER record has been inserted on DB
      expect(producerIdResult?.producerId).toBe(producerId);
      const response = await findByEserviceIdAndProducerIdAndDescriptorId(
        eServiceId,
        descriptorId,
        producerId,
        config.interopSchema
      );

      expect(response?.state).toEqual(
        EServiceDescriptorStateV1[EServiceDescriptorStateV1.PUBLISHED]
      );
      expect(response?.eservice_id).toEqual(eServiceId);
      expect(response?.descriptor_id).toEqual(descriptorId);
      expect(response?.producer_id).toEqual(producerId);
    });
  });

  describe("EServiceDescriptorUpdated event", () => {
    it("Should update a Eservice record on ESERVICE table", async () => {
      const descriptorId = generateID();
      const version = 1;

      await insertEserviceDescriptor(
        eServiceId,
        descriptorId,
        producerId,
        EServiceDescriptorStateV1[EServiceDescriptorStateV1.DRAFT],
        generateID(),
        version,
        config.interopSchema
      );

      const descriptor = createEserviceDescriptorV1({
        id: descriptorId,
        state: EServiceDescriptorStateV1.PUBLISHED
      });

      const eServiceV1Event = createEserviceDescriptorUpdatedEventV1(
        eServiceId,
        descriptor
      );

      await handleMessageV1(eServiceV1Event, eServiceService, genericLogger);
      const response = await findByEserviceIdAndProducerIdAndDescriptorId(
        eServiceId,
        descriptorId,
        producerId,
        config.interopSchema
      );

      expect(response?.state).toEqual(
        EServiceDescriptorStateV1[EServiceDescriptorStateV1.PUBLISHED]
      );
      expect(response?.eservice_id).toEqual(eServiceId);
      expect(response?.descriptor_id).toEqual(descriptorId);
      expect(response?.producer_id).toEqual(producerId);
    });

    it("Should throw an error if eserviceDescriptor data is missing", async () => {
      const eServiceV1Event = createEserviceDescriptorUpdatedEventV1(
        eServiceId,
        undefined
      );

      await expect(
        handleMessageV1(eServiceV1Event, eServiceService, genericLogger)
      ).rejects.toThrow(/Missing data in kafka message/i);
    });
  });

  describe("EServiceWithDescriptorsDeleted event", () => {
    it("Should delete a descriptor record from ESERVICE table", async () => {
      const descriptorId = generateID();
      const version = 1;

      await insertEserviceDescriptor(
        eServiceId,
        descriptorId,
        producerId,
        EServiceDescriptorStateV1.DRAFT.toString(),
        generateID(),
        version,
        config.interopSchema
      );

      const descriptor = createEserviceDescriptorV1({
        id: descriptorId,
        state: EServiceDescriptorStateV1.PUBLISHED
      });

      const eService = createEServiceV1(
        {
          id: eServiceId,
          producerId
        },
        descriptor
      );

      const eServiceV1Event =
        createEServiceWithDescriptorsDeletedEventV1(eService);

      await handleMessageV1(eServiceV1Event, eServiceService, genericLogger);
      const response = await findByEserviceIdAndProducerIdAndDescriptorId(
        eServiceId,
        descriptorId,
        producerId,
        config.interopSchema
      );

      expect(response).toBe(null);
    });
  });
});
