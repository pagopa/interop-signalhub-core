import { DB, TableName, genericError } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";

export interface IDelegationRepository {
  findBy: (
    delegateId: string,
    eServiceId: string,
    state: string
  ) => Promise<
    {
      delegationId: string;
      eserviceId: string;
      delegatorId: string;
    }[]
  >;
}

export const delegationRepository = (db: DB): IDelegationRepository => {
  const delegationTable: TableName = `${config.interopSchema}.delegation`;
  return {
    async findBy(
      delegateId: string,
      eServiceId: string,
      state: string
    ): Promise<
      {
        delegationId: string;
        eserviceId: string;
        delegatorId: string;
      }[]
    > {
      try {
        const response = await db.manyOrNone(
          `SELECT delegation_id   "delegationId", eservice_id  "eserviceId", delegator_id "delegatorId", delegate_id "delegateId"
           FROM ${delegationTable}
           WHERE delegate_id = $1 
           AND eservice_id = $2 
           AND UPPER(state) = UPPER($3)`,
          [delegateId, eServiceId, state]
        );
        return response;
      } catch (error: unknown) {
        throw genericError(`Error delegationRepository::findBy ${error}`);
      }
    }
  };
};
