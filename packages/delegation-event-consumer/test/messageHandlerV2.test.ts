import {
  DelegationKindV2,
  DelegationStateV2
} from "@pagopa/interop-outbound-models";
import { genericLogger } from "pagopa-signalhub-commons";
import { describe, expect, it } from "vitest";

import { config } from "../src/config/env.js";
import { handleMessageV2 } from "../src/handlers/messageHandlerV2.js";
import { findDelegationById } from "./databaseUtils.js";
import {
  createConsumerDelegationSubmittedEventV2,
  createDelegationApprovedEventV2,
  createDelegationV2Event,
  delegationService,
  generateID,
  processDelegationInsertion
} from "./utils.js";

describe("Message Handler for V2 EVENTS", () => {
  describe("Should matching Event", () => {
    describe("ConsumerDelegationSubmitted", () => {
      it("Should add a delegation with kind=CONSUMER", async () => {
        const delegationId = generateID();
        const eserviceId = generateID();
        const delegateId = "delegate-entity-id";
        const delegatorId = "delegator-entity-id";

        const delegationV2 = createDelegationV2Event(
          delegationId,
          delegateId,
          delegatorId,
          eserviceId,
          DelegationStateV2.WAITING_FOR_APPROVAL,
          DelegationKindV2.DELEGATED_CONSUMER
        );

        const delegationV2Event =
          createConsumerDelegationSubmittedEventV2(delegationV2);

        await handleMessageV2(
          delegationV2Event,
          delegationService,
          genericLogger
        );

        const result = await findDelegationById(
          delegationId,
          config.interopSchema
        );

        expect(result).not.toBeNull();
        expect(result?.delegation_id).toBe(delegationId);
        expect(result?.kind).toBe(DelegationKindV2[delegationV2.kind]);
        expect(result?.state).toBe(DelegationStateV2[delegationV2.state]);
      });
    });

    describe("ProducerDelegationSubmitted", () => {
      it("Should add a delegation with kind=CONSUMER", async () => {
        const delegationId = generateID();
        const eserviceId = generateID();
        const delegateId = "delegate-entity-id";
        const delegatorId = "delegator-entity-id";

        const delegationV2 = createDelegationV2Event(
          delegationId,
          delegateId,
          delegatorId,
          eserviceId,
          DelegationStateV2.WAITING_FOR_APPROVAL,
          DelegationKindV2.DELEGATED_PRODUCER
        );

        const delegationV2Event =
          createConsumerDelegationSubmittedEventV2(delegationV2);

        await handleMessageV2(
          delegationV2Event,
          delegationService,
          genericLogger
        );

        const result = await findDelegationById(
          delegationId,
          config.interopSchema
        );

        expect(result).not.toBeNull();
        expect(result?.delegation_id).toBe(delegationId);
        expect(result?.kind).toBe(DelegationKindV2[delegationV2.kind]);
        expect(result?.state).toBe(DelegationStateV2[delegationV2.state]);
      });
    });

    describe("ConsumerDelegationApproved", () => {
      it("Should update existed delegation available with state = ACTIVE", async () => {
        const delegationId = generateID();
        const delegateId = "delegate-entity-id";
        const delegatorId = "delegator-entity-id";
        const eserviceId = generateID();

        await processDelegationInsertion(
          delegationId,
          delegateId,
          delegatorId,
          eserviceId,
          DelegationKindV2.DELEGATED_CONSUMER,
          DelegationStateV2.ACTIVE
        );

        const delegationV2 = createDelegationV2Event(
          delegationId,
          delegateId,
          delegatorId,
          eserviceId,
          DelegationStateV2.ACTIVE,
          DelegationKindV2.DELEGATED_CONSUMER
        );

        const delegationV2Event = createDelegationApprovedEventV2(
          "ConsumerDelegationApproved",
          delegationV2
        );

        await handleMessageV2(
          delegationV2Event,
          delegationService,
          genericLogger
        );

        const result = await findDelegationById(
          delegationId,
          config.interopSchema
        );

        expect(result).not.toBeNull();
        expect(result?.delegation_id).toBe(delegationId);
        expect(result?.kind).toBe(DelegationKindV2[delegationV2.kind]);
        expect(result?.state).toBe(DelegationStateV2[delegationV2.state]);
      });
    });
    describe("ProducerDelegationApproved", () => {
      it("Should update existed delegation available with state = ACTIVE", async () => {
        const delegationId = generateID();
        const delegateId = "delegate-entity-id";
        const delegatorId = "delegator-entity-id";
        const eserviceId = generateID();

        await processDelegationInsertion(
          delegationId,
          delegateId,
          delegatorId,
          eserviceId,
          DelegationKindV2.DELEGATED_PRODUCER,
          DelegationStateV2.ACTIVE
        );

        const delegationV2 = createDelegationV2Event(
          delegationId,
          delegateId,
          delegatorId,
          eserviceId,
          DelegationStateV2.ACTIVE,
          DelegationKindV2.DELEGATED_PRODUCER
        );

        const delegationV2Event = createDelegationApprovedEventV2(
          "ConsumerDelegationApproved",
          delegationV2
        );

        await handleMessageV2(
          delegationV2Event,
          delegationService,
          genericLogger
        );

        const result = await findDelegationById(
          delegationId,
          config.interopSchema
        );

        expect(result).not.toBeNull();
        expect(result?.delegation_id).toBe(delegationId);
        expect(result?.kind).toBe(DelegationKindV2[delegationV2.kind]);
        expect(result?.state).toBe(DelegationStateV2[delegationV2.state]);
      });
    });
  });
});
