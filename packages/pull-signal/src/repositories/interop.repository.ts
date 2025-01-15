import { DB, TableName, genericError } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";

export interface IInteropRepository {
  findAgreementAndPurposeBy: (
    eserviceId: string,
    consumerId: string,
    eserviceAllowedStates: string[],
    purposeState: string,
    agreementState: string
  ) => Promise<
    {
      eserviceId: string;
      agreementId: string;
      purposeId: string;
    }[]
  >;

  findAgreementAndPurposeInDelegationBy: (
    eserviceId: string,
    consumerId: string,
    eserviceAllowedStates: string[],
    purposeState: string,
    agreementState: string,
    delegationId: string
  ) => Promise<
    {
      eserviceId: string;
      agreementId: string;
      purposeId: string;
    }[]
  >;
}

export const interopRepository = (db: DB): IInteropRepository => {
  const eserviceTable: TableName = `${config.interopSchema}.eservice`;
  const agreementTable: TableName = `${config.interopSchema}.agreement`;
  const purposeTable: TableName = `${config.interopSchema}.purpose`;
  return {
    async findAgreementAndPurposeBy(
      eserviceId: string,
      consumerId: string,
      eserviceAllowedStates: string[],
      purposeState: string,
      agreementState: string
    ): Promise<
      {
        eserviceId: string;
        agreementId: string;
        purposeId: string;
      }[]
    > {
      const sqlConditionStates = eserviceAllowedStates
        .map(
          (eServiceState) => `UPPER(eservice.state) = UPPER('${eServiceState}')`
        )
        .join(" OR ");

      try {
        return await db.manyOrNone(
          `SELECT
                eservice.eservice_id eserviceId, agreement.agreement_id agreementId, purpose.purpose_id purposeId
           FROM
                ${eserviceTable} eservice, ${agreementTable} agreement, ${purposeTable} purpose
           WHERE
                eservice.eservice_id = $1
           AND  eservice.enabled_signal_hub is true
           AND  (${sqlConditionStates})
           AND  agreement.consumer_id = $2
           AND  agreement.eservice_id = eservice.eservice_id
           AND  UPPER(agreement.state) = UPPER($3)
           AND  purpose.consumer_id = agreement.consumer_id
           AND  purpose.eservice_id = eservice.eservice_id
           AND  UPPER(purpose.purpose_state) = UPPER($4)`,
          [eserviceId, consumerId, agreementState, purposeState]
        );
      } catch (error: unknown) {
        throw genericError(`Error interopRepository::findBy ${error}`);
      }
    },

    async findAgreementAndPurposeInDelegationBy(
      eserviceId: string,
      consumerId: string,
      eserviceAllowedStates: string[],
      purposeState: string,
      agreementState: string,
      delegationId: string
    ): Promise<
      {
        eserviceId: string;
        agreementId: string;
        purposeId: string;
      }[]
    > {
      const sqlConditionStates = eserviceAllowedStates
        .map(
          (eServiceState) => `UPPER(eservice.state) = UPPER('${eServiceState}')`
        )
        .join(" OR ");

      try {
        return await db.manyOrNone(
          `SELECT
                eservice.eservice_id eserviceId, agreement.agreement_id agreementId, purpose.purpose_id purposeId
           FROM
                ${eserviceTable} eservice, ${agreementTable} agreement, ${purposeTable} purpose
           WHERE
                eservice.eservice_id = $1
           AND  eservice.enabled_signal_hub is true
           AND  eservice.client_access_delegable is true
           AND  (${sqlConditionStates})
           AND  agreement.consumer_id = $2
           AND  agreement.eservice_id = eservice.eservice_id
           AND  UPPER(agreement.state) = UPPER($3)
           AND  purpose.consumer_id = agreement.consumer_id
           AND  purpose.eservice_id = eservice.eservice_id
           AND  purpose.delegation_id = $4
           AND  UPPER(purpose.purpose_state) = UPPER($5)`,
          [eserviceId, consumerId, agreementState, delegationId, purposeState]
        );
      } catch (error: unknown) {
        throw genericError(`Error interopRepository::findBy ${error}`);
      }
    }
  };
};

export type InteropRepository = typeof interopRepository;
