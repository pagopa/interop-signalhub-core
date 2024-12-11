import { DB, TableName, genericInternalError } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";

export interface IDelegationRepository {
  readonly insertDelegation: (
    delegationId: string,
    delegateId: string,
    delegatorId: string,
    eServiceId: string,
    state: string,
    kind: string
  ) => Promise<void>;

  readonly updateDelegation: (
    delegationId: string,
    delegateId: string,
    delegatorId: string,
    eServiceId: string,
    state: string,
    kind: string
  ) => Promise<void>;
}

export const delegationRepository = (db: DB): IDelegationRepository => {
  const delegationTable: TableName = `${config.interopSchema}.delegation`;
  return {
    async insertDelegation(
      delegationId: string,
      delegateId: string,
      delegatorId: string,
      eServiceId: string,
      state: string,
      kind: string
    ): Promise<void> {
      try {
        await db.oneOrNone(
          `INSERT INTO ${delegationTable} (delegation_id, delegate_id, delegator_id, e_service_id, state, kind) VALUES ($1, $2, $3, $4, $5, $6, )`,
          [delegationId, delegateId, delegatorId, eServiceId, state, kind]
        );
      } catch (error) {
        throw genericInternalError(`Error insertDelegation:" ${error} `);
      }
    },
    async updateDelegation(
      delegationId: string,
      delegateId: string,
      delegatorId: string,
      eServiceId: string,
      state: string,
      kind: string
    ): Promise<void> {
      try {
        await db.oneOrNone(
          `UPDATE ${delegationTable} SET delegate_id = $2, delegator_id = $3, e_service_id = $4, state = $5, kind = $6, WHERE delegation_id = $1`,
          [delegationId, delegateId, delegatorId, eServiceId, state, kind]
        );
      } catch (error) {
        throw genericInternalError(`Error updateDelegation:" ${error} `);
      }
    }
  };
};
