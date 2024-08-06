import { describe, expect, it } from "vitest";
import {
  createEServiceV2,
  createEserviceAddedEventV2,
  eServiceService,
  generateID,
  getDescriptorV2,
} from "./utils.js";
import { EServiceDescriptorStateV2 } from "@pagopa/interop-outbound-models";
import { handleMessageV2 } from "../src/handlers/messageHandlerV2.js";
import { genericLogger } from "pagopa-signalhub-commons";
import { findByEserviceIdAndProducerIdAndDescriptorId } from "./databaseUtils.js";

describe("Message Handler for V2 EVENTS", () => {
  describe("EserviceAdded Event", () => {
    it("Should add an Eservice", async () => {
      const eServiceId = generateID();
      const descriptorId = generateID();

      const producerId = "producer-test-idV2";

      const descriptor = getDescriptorV2({
        id: descriptorId,
        state: EServiceDescriptorStateV2.DRAFT,
      });

      const eServiceV2 = createEServiceV2({
        id: eServiceId,
        producerId: producerId,
        descriptors: [descriptor],
      });

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
});
