import {
  DelegationEventV2,
  DelegationStateV2,
  DelegationV2
} from "@pagopa/interop-outbound-models";
import { Logger, kafkaMessageMissingData } from "pagopa-signalhub-commons";
import { P, match } from "ts-pattern";

import { config } from "../config/env.js";
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

        delegationService.insertDelegation(delegation, logger);
      }
    )
    .with(
      {
        type: P.union(
          "ConsumerDelegationApproved",
          "ProducerDelegationApproved"
        )
      },
      async (evt) => {
        const delegation = fromDelegationEventV2ToDelegationEntity(
          evt.data.delegation,
          evt.stream_id,
          evt.version,
          event.type
        );

        delegationService.updateDelegation(delegation, logger);
      }
    )
    .with(
      {
        type: P.union(
          "ConsumerDelegationRejected",
          "ConsumerDelegationRevoked",
          "ProducerDelegationRejected",
          "ProducerDelegationRevoked"
        )
      },
      async (evt) => {
        logger.info(`Need to be implemented ${evt.data.delegation}`);
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
    delegation_id: delegation.id,
    delegate_id: delegation.delegateId,
    delegator_id: delegation.delegatorId,
    e_service_id: delegation.eserviceId,
    state: DelegationStateV2[delegation.state],
    kind: DelegationStateV2[delegation.kind],
    event_version_id: version,
    event_stream_id: streamId
  };
};
