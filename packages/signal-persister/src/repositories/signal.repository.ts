import { DB, Signal, TableName } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";

export interface ISignalRepository {
  getSignalById: (
    signalId: number,
    eserviceId: string,
  ) => Promise<null | number>;
  insertSignal: (signal: Signal) => Promise<null | number>;
}

export const signalRepository = (db: DB): ISignalRepository => {
  const signalTable: TableName = `${config.signalHubSchema}.signal`;

  return {
    async getSignalById(
      signalId: number,
      eserviceId: string,
    ): Promise<null | number> {
      return await db.oneOrNone(
        `SELECT signal_id FROM ${signalTable} WHERE eservice_id = $1 AND signal_id = $2`,
        [eserviceId, signalId],
      );
    },

    async insertSignal(signal): Promise<null | number> {
      return await db.oneOrNone(
        `INSERT INTO ${signalTable}(correlation_id, signal_id,object_id,eservice_id, object_type, signal_type) VALUES($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          signal.correlationId,
          signal.signalId,
          signal.objectId,
          signal.eserviceId,
          signal.objectType,
          signal.signalType,
        ],
        (rec) => rec.id,
      );
    },
  };
};

export type SignalRepository = typeof signalRepository;
