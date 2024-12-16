import {
  DelegationEventV2,
  DelegationKindV2,
  DelegationStateV2,
  DelegationV2
} from "@pagopa/interop-outbound-models";
import { randomUUID } from "crypto";
import { setupTestContainersVitest } from "pagopa-signalhub-commons-test/index.js";
import { inject } from "vitest";

import { delegationRepository } from "../src/repositories/delegation.repository.js";
import { delegationServiceBuilder } from "../src/services/delegation.service.js";

export const generateID = (): string => randomUUID();
export const { postgresDB } = await setupTestContainersVitest(
  inject("signalHubStoreConfig")
);

const delegationRepositoryInstance = delegationRepository(postgresDB);
export const delegationService = delegationServiceBuilder(
  delegationRepositoryInstance
);

export const createDelegationV2Event = (
  delegationId: string,
  delegateId: string,
  delegatorId: string,
  eServiceId: string,
  state: DelegationStateV2,
  kind: DelegationKindV2
): DelegationV2 => ({
  id: delegationId,
  delegateId: delegateId,
  delegatorId: delegatorId,
  eserviceId: eServiceId,
  state: state,
  kind: kind,
  createdAt: 1n,
  submittedAt: 1n
});

export const createConsumerDelegationSubmittedEventV2 = (
  delegation: DelegationV2,
  streamId?: string,
  version?: number
): DelegationEventV2 => ({
  type: "ConsumerDelegationSubmitted",
  data: {
    delegation: delegation
  },
  event_version: 2,
  stream_id: streamId || generateID(),
  version: version || 1,
  timestamp: new Date()
});
