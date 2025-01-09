import { DB, Logger } from "pagopa-signalhub-commons";

import { operationPullForbidden } from "../model/domain/errors.js";
import { interopRepository } from "../repositories/interop.repository.js";

interface IInteropService {
  readonly consumerIsAuthorizedToPullSignals: (
    consumerId: string,
    eserviceId: string,
    logger: Logger
  ) => Promise<void>;
}
export function interopServiceBuilder(db: DB): IInteropService {
  return {
    async consumerIsAuthorizedToPullSignals(
      consumerId: string,
      eserviceId: string,
      logger: Logger
    ): Promise<void> {
      logger.info(
        `InteropService::consumerIsAuthorizedToPullSignals with consumerId: ${consumerId}`
      );

      // Castelfranco Veneto è delegante in fruizione
      // Ferrara è delegato
      // delegation = xxx
      // e-service = abc

      // Copparo è delegante in fruizione
      // Ferrara è delegato
      // delegation = xyz
      // e-service = abc

      // agreement
      // consumerId: Copparo
      // delegationId: xyz

      // esiste una DELEGA attiva per quel consumerId e eserviceId?
      // NO: non c'è delega, quindi consumerIds = ['consumerId']
      // SI: delegationId, ENTE = delegatorId

      // delegationId --> agreement, purpose
      // consumerIds = ['id Copparo', 'id Castelfranco']

      // E-SERVICE
      // ENTE
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
      if (thereAreNo(administrativeActs)) {
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
