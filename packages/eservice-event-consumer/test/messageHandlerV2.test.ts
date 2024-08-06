import { describe, expect, it } from "vitest";
import {
  createEserviceAddedEventV2,
  createEServiceDescriptorAddedEventV2,
  eServiceService,
  generateID,
  createEServiceWithDescriptorsDeletedEventV2,
  createV2Event,
  createEServiceDescriptorUpdatedEventV2,
  incrementVersion,
  getDescriptorV2,
} from "./utils.js";
import { EServiceDescriptorStateV2 } from "@pagopa/interop-outbound-models";
import { handleMessageV2 } from "../src/handlers/messageHandlerV2.js";
import { genericLogger } from "pagopa-signalhub-commons";
import {
  findByEserviceIdAndProducerIdAndDescriptorId,
  getCountByEserviceId,
  insertEserviceDescriptor,
} from "./databaseUtils.js";

describe("Message Handler for V2 EVENTS", () => {
  describe("Should matching Event", () => {
    describe("EserviceAdded Event", () => {
      it("Should add an Eservice", async () => {
        const eServiceId = generateID();
        const descriptorId = generateID();
        const producerId = "producer-test-idV2";

        const eServiceV2 = createV2Event(
          eServiceId,
          descriptorId,
          producerId,
          EServiceDescriptorStateV2.DRAFT
        );

        const eServiceV2Event = createEserviceAddedEventV2(eServiceV2);

        await handleMessageV2(eServiceV2Event, eServiceService, genericLogger);
        const result = await findByEserviceIdAndProducerIdAndDescriptorId(
          eServiceId,
          descriptorId,
          producerId
        );

        expect(result).not.toBeNull();
        expect(result.eservice_id).toEqual(eServiceId);
        expect(result.descriptor_id).toEqual(descriptorId);
        expect(result.producer_id).toEqual(producerId);
      });
    });

    describe("EServiceDescriptorAdded Event", () => {
      it("Should add new EService descriptor on EService table", async () => {
        const eServiceId = generateID();
        const descriptorId = generateID();
        const producerId = "producer-test-id-eserviceDescriptorAdded";

        const eServiceV2 = createV2Event(
          eServiceId,
          descriptorId,
          producerId,
          EServiceDescriptorStateV2.DRAFT
        );

        const eServiceV2Event = createEServiceDescriptorAddedEventV2(
          eServiceV2,
          descriptorId
        );

        await handleMessageV2(eServiceV2Event, eServiceService, genericLogger);
        const result = await findByEserviceIdAndProducerIdAndDescriptorId(
          eServiceId,
          descriptorId,
          producerId
        );

        expect(result).not.toBeNull();
        expect(result.eservice_id).toEqual(eServiceId);
        expect(result.descriptor_id).toEqual(descriptorId);
        expect(result.producer_id).toEqual(producerId);
      });
    });
    describe("EServiceDescriptorPublished event", () => {
      it("Should update a state with PUBLISHED on EService table", async () => {
        const eServiceId = generateID();
        const descriptorId = generateID();
        const producerId = "producer-test-id-eserviceDescriptorPublished";
        const initalVersion = 1;
        // Insert Eservice

        await insertEserviceDescriptor(
          eServiceId,
          descriptorId,
          producerId,
          EServiceDescriptorStateV2.DRAFT.toString(),
          generateID(),
          initalVersion
        );

        const eServiceV2 = createV2Event(
          eServiceId,
          descriptorId,
          producerId,
          EServiceDescriptorStateV2.PUBLISHED
        );

        const eventV2 = createEServiceDescriptorUpdatedEventV2(
          "EServiceDescriptorPublished",
          eServiceV2,
          descriptorId,
          undefined,
          incrementVersion(initalVersion)
        );

        await handleMessageV2(eventV2, eServiceService, genericLogger);

        const result = await findByEserviceIdAndProducerIdAndDescriptorId(
          eServiceId,
          descriptorId,
          producerId
        );

        expect(result).not.toBeNull();
        expect(result.eservice_id).toEqual(eServiceId);
        expect(result.descriptor_id).toEqual(descriptorId);
        expect(result.producer_id).toEqual(producerId);
        expect(result.state).toEqual(
          EServiceDescriptorStateV2.PUBLISHED.toString()
        );
      });
    });

    describe("EServiceDescriptorArchived event", () => {
      it("Should update a state with ARCHIVED on EService table", async () => {
        const eServiceId = generateID();
        const descriptorId = generateID();
        const producerId = "producer-test-id-eserviceDescriptorArchived";
        const initalVersion = 1;
        const eventStreamId = generateID();

        await insertEserviceDescriptor(
          eServiceId,
          descriptorId,
          producerId,
          EServiceDescriptorStateV2.PUBLISHED.toString(),
          eventStreamId,
          initalVersion
        );

        const eServiceV2 = createV2Event(
          eServiceId,
          descriptorId,
          producerId,
          EServiceDescriptorStateV2.ARCHIVED
        );

        const eventV2 = createEServiceDescriptorUpdatedEventV2(
          "EServiceDescriptorArchived",
          eServiceV2,
          descriptorId,
          eventStreamId,
          incrementVersion(initalVersion)
        );

        await handleMessageV2(eventV2, eServiceService, genericLogger);

        const result = await findByEserviceIdAndProducerIdAndDescriptorId(
          eServiceId,
          descriptorId,
          producerId
        );

        expect(result).not.toBeNull();
        expect(result.eservice_id).toEqual(eServiceId);
        expect(result.descriptor_id).toEqual(descriptorId);
        expect(result.producer_id).toEqual(producerId);
        expect(result.state).toEqual(
          EServiceDescriptorStateV2.ARCHIVED.toString()
        );
      });
    });

    describe("EServiceDescriptorUpdated Event", () => {
      it("Should update an existing EService descriptor on EService table", async () => {
        const eServiceId = generateID();
        const descriptorId = generateID();
        const producerId = "producer-test-id-eserviceDescriptorUpdated";

        const eServiceV2 = createV2Event(
          eServiceId,
          descriptorId,
          producerId,
          EServiceDescriptorStateV2.DRAFT
        );

        const eServiceV2Event = createEServiceDescriptorAddedEventV2(
          eServiceV2,
          descriptorId
        );

        await handleMessageV2(eServiceV2Event, eServiceService, genericLogger);

        const eServiceV2Updated = createV2Event(
          eServiceId,
          descriptorId,
          producerId,
          EServiceDescriptorStateV2.DRAFT
        );

        const eServiceV2EventUpdated = createEServiceDescriptorAddedEventV2(
          eServiceV2Updated,
          descriptorId
        );

        await handleMessageV2(
          eServiceV2EventUpdated,
          eServiceService,
          genericLogger
        );

        const result = await findByEserviceIdAndProducerIdAndDescriptorId(
          eServiceId,
          descriptorId,
          producerId
        );

        expect(result).not.toBeNull();
        expect(result.eservice_id).toEqual(eServiceId);
        expect(result.descriptor_id).toEqual(descriptorId);
        expect(result.producer_id).toEqual(producerId);
      });
    });

    describe("EServiceDescriptorDeleted Event", () => {
      it("Should delete an existing EService descriptor on EService table", async () => {
        const eServiceId = generateID();
        const descriptorId = generateID();
        const producerId = "producer-test-id-eserviceDescriptorDeleted";

        const eServiceV2 = createV2Event(
          eServiceId,
          descriptorId,
          producerId,
          EServiceDescriptorStateV2.DRAFT
        );

        const eServiceV2Event = createEServiceWithDescriptorsDeletedEventV2(
          eServiceV2,
          descriptorId
        );

        await handleMessageV2(eServiceV2Event, eServiceService, genericLogger);
        const response = await findByEserviceIdAndProducerIdAndDescriptorId(
          eServiceId,
          descriptorId,
          producerId
        );

        expect(response).toBe(null);
      });
    });
  });

  describe("Logic handling where there are several descriptors for the same eservice", () => {
    it("Should added only one descriptor if other two are already on eservice table", async () => {
      // Added first eservice's descriptor

      const eServiceId = generateID();
      const descriptorIdV1 = generateID();
      const producerId = "producer-test-id";
      const eventStreamId = generateID();
      const initialVersion = 1;

      const descriptorVersion1 = getDescriptorV2({
        id: descriptorIdV1,
        state: EServiceDescriptorStateV2.DRAFT,
      });

      await insertEserviceDescriptor(
        eServiceId,
        descriptorVersion1.id,
        producerId,
        descriptorVersion1.state.toString(),
        eventStreamId,
        initialVersion
      );

      // Added second eservice's descriptor

      const descriptorIdV2 = generateID();

      const descriptorVersion2 = getDescriptorV2({
        id: descriptorIdV2,
        state: EServiceDescriptorStateV2.PUBLISHED,
      });

      await insertEserviceDescriptor(
        eServiceId,
        descriptorVersion2.id,
        producerId,
        descriptorVersion2.state.toString(),
        eventStreamId,
        incrementVersion(initialVersion)
      );

      // Create event for the third descriptor
      const descriptorEvent = getDescriptorV2({
        id: generateID(),
        state: EServiceDescriptorStateV2.DRAFT,
      });

      const eServiceV2 = createV2Event(
        eServiceId,
        descriptorIdV2,
        producerId,
        EServiceDescriptorStateV2.DRAFT,
        [descriptorVersion1, descriptorVersion2, descriptorEvent]
      );

      const eServiceV2Event = createEServiceDescriptorAddedEventV2(
        eServiceV2,
        descriptorEvent.id
      );

      await handleMessageV2(eServiceV2Event, eServiceService, genericLogger);

      const eServiceCount = await getCountByEserviceId(eServiceId);
      expect(eServiceCount).toBe(3);
    });
  });
});
