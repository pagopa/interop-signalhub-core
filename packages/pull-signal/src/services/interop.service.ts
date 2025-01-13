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
  const consumerHasNotADelegation = async (
    consumerId: string,
    eserviceId: string,
    logger: Logger
  ): Promise<boolean> => {
    const delegations = await delegationRepository(db).findBy(
      consumerId,
      eserviceId
    );

    // this means that the consumer has no delegations
    if (thereAreNo(delegations)) {
      return true;
    }

    // For each delegation we have to check if an agreement and at least one purpose is ACTIVE. Once find one we can skip the others
    for (const delegation of delegations) {
      const eserviceState = ["PUBLISHED", "DEPRECATED"];
      const agreementState = "ACTIVE";
      const purposeState = "ACTIVE";

      const administrativeActs = await interopRepository(db).findBy(
        delegation.eserviceId,
        delegation.delegatorId, // delegante
        eserviceState,
        purposeState,
        agreementState
      );

      if (administrativeActs.length > 0) {
        logger.info(
          `InteropService::consumerHasADelegation : delegate with id:${consumerId} has a delegation for eservice ${delegation.eserviceId} with delegationId ${delegation.delegationId} `
        );
        return false;
      }
    }

    return true;
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

      const eserviceState = ["PUBLISHED", "DEPRECATED"];
      const agreementState = "ACTIVE";
      const purposeState = "ACTIVE";
      const administrativeActs = await interopRepository(db).findBy(
        eserviceId,
        consumerId,
        eserviceState,
        purposeState,
        agreementState
      );
      if (
        thereAreNo(administrativeActs) &&
        (await consumerHasNotADelegation(consumerId, eserviceId, logger))
      ) {
        throw operationPullForbidden({
          eserviceId,
          consumerId
        });
      }
    }
  };
}

export type InteropService = ReturnType<typeof interopServiceBuilder>;

function thereAreNo(result: unknown[]): boolean {
  return !result?.length;
}
