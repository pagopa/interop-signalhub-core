import { Logger, genericInternalError } from "pagopa-signalhub-commons";

import { DelegationV2Entity } from "../models/domain/model.js";
import { IDelegationRepository } from "../repositories/index.js";

export interface IDelegationService {
  readonly insertDelegation: (
    delegation: DelegationV2Entity,
    logger: Logger
  ) => Promise<void>;

  readonly updateDelegation: (
    delegation: DelegationV2Entity,
    logger: Logger
  ) => Promise<void>;
}

export function delegationServiceBuilder(
  delegationServiceRepository: IDelegationRepository
): IDelegationService {
  return {
    async insertDelegation(
      delegation: DelegationV2Entity,
      logger: Logger
    ): Promise<void> {
      try {
        const {
          delegation_id,
          delegate_id,
          delegator_id,
          e_service_id,
          state,
          kind
        } = delegation;
        logger.info(
          `Saving event (insert) : id: ${delegation_id}, delegateId: ${delegate_id}, delegatorId: ${delegator_id}, eServiceId: ${e_service_id}`
        );

        await delegationServiceRepository.insertDelegation(
          delegation_id,
          delegate_id,
          delegator_id,
          e_service_id,
          state,
          kind
        );
      } catch (error) {
        throw genericInternalError(`Error insertDelegation:" ${error} `);
      }
    },

    async updateDelegation(
      delegation: DelegationV2Entity,
      logger: Logger
    ): Promise<void> {
      try {
        const {
          delegation_id,
          delegate_id,
          delegator_id,
          e_service_id,
          state,
          kind
        } = delegation;

        logger.info(
          `Saving event (update) : id: ${delegation_id}, delegateId: ${delegate_id}, delegatorId: ${delegator_id}, eServiceId: ${e_service_id}`
        );
        await delegationServiceRepository.updateDelegation(
          delegation_id,
          delegate_id,
          delegator_id,
          e_service_id,
          state,
          kind
        );
      } catch (error) {
        throw genericInternalError(`Error updateDelegation:" ${error} `);
      }
    }
  };
}
