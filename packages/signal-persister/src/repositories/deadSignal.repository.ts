import { DB, TableName } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";
import { recoverableMessageError } from "../models/domain/errors.js";
import { DeadSignal } from "../models/domain/model.js";

export interface IDeadSignalRepository {
  insertDeadSignal: (deadSignal: DeadSignal) => Promise<number | null>;
}

export const deadSignalRepository = (db: DB): IDeadSignalRepository => {
  const deadSignalTable: TableName = `${config.signalHubSchema}.dead_signal`;

  return {
    async insertDeadSignal(deadSignal): Promise<number | null> {
      try {
        return await db.oneOrNone(
          `INSERT INTO ${deadSignalTable} (correlation_id, signal_id,object_id,eservice_id, object_type, signal_type,error_reason) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [
            deadSignal.correlationId,
            deadSignal.signalId,
            deadSignal.objectId,
            deadSignal.eserviceId,
            deadSignal.objectType,
            deadSignal.signalType,
            deadSignal.errorReason
          ],
          (rec) => rec.id
        );
      } catch (error) {
        throw recoverableMessageError("dbConnection");
      }
    }
  };
};

export type DeadSignalRepository = typeof deadSignalRepository;
