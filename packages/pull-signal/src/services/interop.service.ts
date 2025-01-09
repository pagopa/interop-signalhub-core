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
        // ci sono deleghe operative?
        // Castelfranco Veneto è delegante in fruizione
        // Ferrara è delegato
        // delegation = wyk
        // e-service = abc

        // Copparo è delegante in fruizione
        // Ferrara è delegato
        // delegation = xyz
        // e-service = abc

        // agreement
        // consumerId: Copparo (in AgreementV2.consumerId)
        // delegationId: xyz (in AgreementV2.AgreementStampsV2.submission.delegationId)

        // agreement
        // consumerId: Castelfranco (in AgreementV2.consumerId)
        // delegationId: wyk (in AgreementV2.AgreementStampsV2.submission.delegationId)

        // purpose
        // consumerId: Copparo (in PurposeV2.consumerId)
        // delegationId: xyz (in PurposeV2.delegationId)

        // esiste una DELEGA attiva con gestione del client per (consumerId, eserviceId)?
        // find in delegation where eserviceId, delegateId = consumerId + find in eservice where eserviceId
        // NO: not delega OR (delega and not gestione client), caso usuale: usare consumerId in input
        // SI: (delega and gestione client) delegationIds = [xyz.id, wyk.id], consumerIds = ['id Copparo', 'id Castelfranco']

        // (CASO SI DELEGA AND CLIENT) loop on delegationIds: find in e-service, agreement, purpose by eserviceId, delegationId
        // - EServiceV2.isClientAccessDelegable = true
        // - PurposeV2.delegationId = delegationId
        // è sufficiente delegationId, senza usare consumerId?

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
