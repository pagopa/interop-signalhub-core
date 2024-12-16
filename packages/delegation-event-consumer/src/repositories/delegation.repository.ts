import { DB, TableName, genericInternalError } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";

export interface IDelegationRepository {
  readonly eventWasProcessed: (
    streamId: string,
    version: number
  ) => Promise<boolean>;

  readonly insertDelegation: (
    delegationId: string,
    delegateId: string,
    delegatorId: string,
    eServiceId: string,
    state: string,
    kind: string,
    eventStreamId: string,
    eventVersionId: number
  ) => Promise<void>;

  readonly updateDelegation: (
    delegationId: string,
    delegateId: string,
    delegatorId: string,
    eServiceId: string,
    state: string,
    kind: string,
    eventStreamId: string,
    eventVersionId: number
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
      kind: string,
      eventStreamId: string,
      eventVersionId: number
    ): Promise<void> {
      try {
        await db.oneOrNone(
          `INSERT INTO ${delegationTable} (delegation_id, delegate_id, delegator_id, eservice_id, state, kind,event_stream_id,event_version_id) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            delegationId,
            delegateId,
            delegatorId,
            eServiceId,
            state,
            kind,
            eventStreamId,
            eventVersionId
          ]
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
      kind: string,
      eventStreamId: string,
      eventVersionId: number
    ): Promise<void> {
      try {
        await db.oneOrNone(
          `UPDATE ${delegationTable} 
           SET delegate_id = $2, delegator_id = $3, eservice_id = $4, state = $5, kind = $6, event_stream_id= $7, event_version_id= $8
           WHERE delegation_id = $1`,
          [
            delegationId,
            delegateId,
            delegatorId,
            eServiceId,
            state,
            kind,
            eventStreamId,
            eventVersionId
          ]
        );
      } catch (error) {
        throw genericInternalError(`Error updateDelegation:" ${error} `);
      }
    },

    async eventWasProcessed(
      streamId: string,
      version: number
    ): Promise<boolean> {
      try {
        const response = await db.oneOrNone(
          `select event_stream_id, event_version_id from ${delegationTable} a where a.event_stream_id = $1 AND a.event_version_id = $2`,
          [streamId, version]
        );
        return response ? true : false;
      } catch (error) {
        throw genericInternalError(`Error eventWasProcessed:" ${error} `);
      }
    }
  };
};
