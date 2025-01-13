import { DB, TableName, genericError } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";

export interface IDelegationRepository {
  findBy: (
    organizationId: string,
    eServiceId: string
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
      organizationId: string,
      eServiceId: string
    ): Promise<
      {
        delegationId: string;
        eserviceId: string;
        delegatorId: string;
      }[]
    > {
      try {
        return await db.manyOrNone(
          `SELECT delegation_id, eservice_id, delegator_id FROM ${delegationTable} WHERE delegator_id = $1 AND eservice_id = $2 AND state = 'ACTIVE'`,
          [organizationId, eServiceId]
        );
      } catch (error: unknown) {
        throw genericError(`Error eserviceRepository::findBy ${error}`);
      }
    }
  };
};
