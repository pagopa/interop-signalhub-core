import { InteropSchema, TableName } from "pagopa-signalhub-commons";

import { DelegationV2Entity } from "../src/models/domain/model.js";
import { postgresDB } from "./utils.js";

export const insertDelegation = async (
  delegation: DelegationV2Entity,
  schema: InteropSchema
): Promise<void> => {
  const delegationTable: TableName = `${schema}.delegation`;
  await postgresDB.oneOrNone(
    `INSERT INTO ${delegationTable} (delegation_id, delegate_id, delegator_id, eservice_id, state, kind,event_stream_id,event_version_id) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      delegation.delegation_id,
      delegation.delegate_id,
      delegation.delegator_id,
      delegation.e_service_id,
      delegation.state,
      delegation.kind,
      delegation.event_stream_id,
      delegation.event_version_id
    ]
  );
};

export const findDelegationById = async (
  id: string,
  schema: InteropSchema
): Promise<DelegationV2Entity | null> => {
  const delegationTable: TableName = `${schema}.delegation`;

  const result = await postgresDB.oneOrNone(
    `SELECT * FROM ${delegationTable} d WHERE d.delegation_id = $1`,
    [id]
  );

  if (!result) {
    return null;
  }

  return result;
};
