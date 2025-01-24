import { DB, Logger } from "pagopa-signalhub-commons";

import { operationPullForbidden } from "../model/domain/errors.js";
import {
  delegationRepository,
  interopRepository
} from "../repositories/index.js";
interface IInteropService {
  readonly consumerIsAuthorizedToPullSignals: (
    consumerId: string,
    eserviceId: string,
    logger: Logger
  ) => Promise<void>;
}
export function interopServiceBuilder(db: DB): IInteropService {
  const eserviceState = ["PUBLISHED", "DEPRECATED"];
  const agreementState = "ACTIVE";
  const purposeState = "ACTIVE";
  const delegationState = "ACTIVE";

  const consumerHasAgreementAndPurpose = async (
    consumerId: string,
    eserviceId: string
  ) => {
    const administrativeActs = await interopRepository(
      db
    ).findAgreementAndPurposeBy(
      eserviceId,
      consumerId,
      eserviceState,
      purposeState,
      agreementState
    );

    if (hasItems(administrativeActs)) {
      return true;
    }

    return false;
  };

  const consumerHasADelegation = async (
    consumerId: string,
    eserviceId: string,
    logger: Logger
  ): Promise<boolean> => {
    const delegations = await delegationRepository(db).findBy(
      consumerId,
      eserviceId,
      delegationState
    );

    if (thereAreNo(delegations)) {
      return false;
    }

    // For each delegation we have to check if an agreement and at least one purpose is ACTIVE. Once find one we can skip the others
    for (const delegation of delegations) {
      const administrativeActs = await interopRepository(
        db
      ).findAgreementAndPurposeInDelegationBy(
        delegation.eserviceId,
        delegation.delegatorId,
        eserviceState,
        purposeState,
        agreementState,
        delegation.delegationId
      );

      if (hasItems(administrativeActs)) {
        logger.info(
          `InteropService::consumerHasADelegation : delegate with id:${consumerId} has a delegation for eservice ${delegation.eserviceId} with delegationId ${delegation.delegationId} `
        );
        return true;
      }
    }

    return false;
  };

  return {
    async consumerIsAuthorizedToPullSignals(
      consumerId: string,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.info(
        `InteropService::consumerIsAuthorizedToPullSignals with consumerId: ${consumerId}`
      );

      if (
        (await consumerHasAgreementAndPurpose(consumerId, eserviceId)) ||
        (await consumerHasADelegation(consumerId, eserviceId, logger))
      ) {
        return;
      }

      throw operationPullForbidden({
        eserviceId,
        consumerId
      });
    }
  };
}

export type InteropService = ReturnType<typeof interopServiceBuilder>;

function thereAreNo(result: unknown[]): boolean {
  return !result?.length;
}

function hasItems(result: unknown[]): boolean {
  return result.length > 0;
}
