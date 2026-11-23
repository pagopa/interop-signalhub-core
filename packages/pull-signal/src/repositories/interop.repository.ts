import { DB, genericError, TableName } from "pagopa-signalhub-commons";

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
      try {
        return await db.manyOrNone(
          `SELECT e.eservice_id AS eserviceId, a.agreement_id AS agreementId, p.purpose_id AS purposeId
           FROM ${eserviceTable} e
           JOIN ${agreementTable} a ON a.eservice_id = e.eservice_id
           JOIN ${purposeTable} p ON p.eservice_id = e.eservice_id AND p.consumer_id = a.consumer_id
           WHERE e.eservice_id = $1 AND a.consumer_id = $2
             AND e.enabled_signal_hub IS TRUE
             AND UPPER(e.state) = ANY($3::text[])
             AND UPPER(a.state) = UPPER($4)
             AND UPPER(p.purpose_state) = UPPER($5)
           LIMIT 1`,
          [
            eserviceId,
            consumerId,
            eserviceAllowedStates.map((state) => state.toUpperCase()),
            agreementState,
            purposeState
          ]
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
      try {
        return await db.manyOrNone(
          `SELECT e.eservice_id AS eserviceId, a.agreement_id AS agreementId, p.purpose_id AS purposeId
           FROM ${eserviceTable} e
           JOIN ${agreementTable} a ON a.eservice_id = e.eservice_id
           JOIN ${purposeTable} p ON p.eservice_id = e.eservice_id AND p.consumer_id = a.consumer_id
           WHERE e.eservice_id = $1 AND a.consumer_id = $2
             AND e.enabled_signal_hub IS TRUE
             AND e.client_access_delegable IS TRUE
             AND UPPER(e.state) = ANY($3::text[])
             AND UPPER(a.state) = UPPER($4)
             AND UPPER(p.purpose_state) = UPPER($5)
             AND p.delegation_id = $6
           LIMIT 1`,
          [
            eserviceId,
            consumerId,
            eserviceAllowedStates.map((state) => state.toUpperCase()),
            agreementState,
            purposeState,
            delegationId
          ]
        );
      } catch (error: unknown) {
        throw genericError(`Error interopRepository::findBy ${error}`);
      }
    }
  };
};

export type InteropRepository = typeof interopRepository;
