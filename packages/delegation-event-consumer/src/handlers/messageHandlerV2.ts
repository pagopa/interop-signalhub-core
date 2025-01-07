import {
  DelegationEventV2,
  DelegationKindV2,
  DelegationStateV2,
  DelegationV2
} from "@pagopa/interop-outbound-models";
import {
  EServiceId,
  Logger,
  kafkaMessageMissingData
} from "pagopa-signalhub-commons";
import { P, match } from "ts-pattern";

import { config } from "../config/env.js";
import { DelegateId, DelegationId, DelegatorId } from "../models/brandedIds.js";
import { DelegationV2Entity } from "../models/domain/model.js";
import { IDelegationService } from "../services/index.js";

export async function handleMessageV2(
  event: DelegationEventV2,
  delegationService: IDelegationService,
  logger: Logger
): Promise<void> {
  await match(event)
    .with(
      {
        type: P.union(
          "ConsumerDelegationSubmitted",
          "ProducerDelegationSubmitted"
        )
      },
      async (evt) => {
        const delegation = fromDelegationEventV2ToDelegationEntity(
          evt.data.delegation,
          evt.stream_id,
          evt.version,
          event.type
        );

        await delegationService.insertDelegation(delegation, logger);
      }
    )
    .with(
      {
        type: P.union(
          "ConsumerDelegationApproved",
          "ProducerDelegationApproved",
          "ConsumerDelegationRejected",
          "ConsumerDelegationRevoked",
          "ProducerDelegationRejected",
          "ProducerDelegationRevoked"
        )
      },
      async (evt) => {
        const delegation = fromDelegationEventV2ToDelegationEntity(
          evt.data.delegation,
          evt.stream_id,
          evt.version,
          event.type
        );

        await delegationService.updateDelegation(delegation, logger);
      }
    )
    .exhaustive();
}

export const fromDelegationEventV2ToDelegationEntity = (
  delegation: DelegationV2 | undefined,
  streamId: string,
  version: number,
  eventType: string
): DelegationV2Entity => {
  if (!delegation) {
    throw kafkaMessageMissingData(config.kafkaTopic, eventType);
  }

  return {
    delegation_id: DelegationId.parse(delegation.id),
    delegate_id: DelegateId.parse(delegation.delegateId),
    delegator_id: DelegatorId.parse(delegation.delegatorId),
    e_service_id: EServiceId.parse(delegation.eserviceId),
    state: DelegationStateV2[delegation.state],
    kind: DelegationKindV2[delegation.kind],
    event_version_id: version,
    event_stream_id: streamId
  };
};
