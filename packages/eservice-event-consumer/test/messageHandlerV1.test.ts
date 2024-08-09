import { beforeAll, describe, expect, it } from "vitest";
import { genericLogger } from "pagopa-signalhub-commons";
import { EServiceDescriptorStateV1 } from "@pagopa/interop-outbound-models";
import { handleMessageV1 } from "../src/handlers/messageHandlerV1.js";
import {
  createEServiceV1,
  generateID,
  eServiceService,
  createEserviceAddedEventV1,
  createEserviceDescriptorV1,
  createEserviceDescriptorAddedEventV1,
  createEserviceDescriptorUpdatedEventV1,
  createEServiceWithDescriptorsDeletedEventV1,
} from "./utils.js";
import {
  findByEserviceIdAndProducerIdAndDescriptorId,
  findProducerIdByEserviceId,
  insertEserviceDescriptor,
  insertEserviceIdAndProducerId,
} from "./databaseUtils.js";

describe("Message Handler for V1 EVENTS", () => {
  const producerId = "producer-test-id";
  const eServiceId = generateID();

  beforeAll(async () => {
    await insertEserviceIdAndProducerId(eServiceId, producerId);
  });

  describe("EserviceAdded Event", () => {
    it("Should add a tuple <eServiceId,producerId> for EServiceAdded event", async () => {
      const eServiceId = generateID();
      const producerId = "producer-test-id";
      const eserviceV1 = createEServiceV1({
        id: eServiceId,
        producerId,
        descriptors: [],
      });

      const eServiceV1Event = createEserviceAddedEventV1(
        eserviceV1,
        generateID()
      );

      await handleMessageV1(eServiceV1Event, eServiceService, genericLogger);
      const result = await findProducerIdByEserviceId(eServiceId);
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
        state: EServiceDescriptorStateV1.PUBLISHED,
      });

      const eServiceV1Event = createEserviceDescriptorAddedEventV1(
        eServiceId,
        descriptor
      );

      await handleMessageV1(eServiceV1Event, eServiceService, genericLogger);
      const result = await findByEserviceIdAndProducerIdAndDescriptorId(
        eServiceId,
        descriptorId,
        producerId
      );

      expect(result?.eservice_id).toEqual(eServiceId);
      expect(result?.producer_id).toEqual(producerId);
      expect(result?.descriptor_id).toEqual(descriptorId);
      expect(result?.state).toEqual(
        EServiceDescriptorStateV1.PUBLISHED.toString()
      ); // TODO: Change handling of State from string to num on DB
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

  describe("EServiceDescriptorUpdated event", () => {
    it("Should update a Eservice record on ESERVICE table", async () => {
      const descriptorId = generateID();
      const version = 1;

      await insertEserviceDescriptor(
        eServiceId,
        descriptorId,
        producerId,
        EServiceDescriptorStateV1.DRAFT.toString(),
        generateID(),
        version
      );

      const descriptor = createEserviceDescriptorV1({
        id: descriptorId,
        state: EServiceDescriptorStateV1.PUBLISHED,
      });

      const eServiceV1Event = createEserviceDescriptorUpdatedEventV1(
        eServiceId,
        descriptor
      );

      await handleMessageV1(eServiceV1Event, eServiceService, genericLogger);
      const response = await findByEserviceIdAndProducerIdAndDescriptorId(
        eServiceId,
        descriptorId,
        producerId
      );

      expect(response?.state).toEqual(
        EServiceDescriptorStateV1.PUBLISHED.toString()
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
        version
      );

      const descriptor = createEserviceDescriptorV1({
        id: descriptorId,
        state: EServiceDescriptorStateV1.PUBLISHED,
      });

      const eService = createEServiceV1(
        {
          id: eServiceId,
          producerId,
        },
        descriptor
      );

      const eServiceV1Event =
        createEServiceWithDescriptorsDeletedEventV1(eService);

      await handleMessageV1(eServiceV1Event, eServiceService, genericLogger);
      const response = await findByEserviceIdAndProducerIdAndDescriptorId(
        eServiceId,
        descriptorId,
        producerId
      );

      expect(response).toBe(null);
    });
  });
});
