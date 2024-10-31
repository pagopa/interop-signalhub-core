import { DB, TableName, genericInternalError } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";

export interface ISignalRepository {
  findBy: (signalId: number, eserviceId: string) => Promise<number | null>;
}

export const signalRepository = (db: DB): ISignalRepository => {
  const signalTable: TableName = `${config.signalHubSchema}.signal`;

  return {
    async findBy(signalId: number, eserviceId: string): Promise<number | null> {
      try {
        return await db.oneOrNone(
          `SELECT signal_id FROM ${signalTable} WHERE eservice_id = $1 AND signal_id = $2`,
          [eserviceId, signalId]
        );
      } catch (error) {
        throw genericInternalError(
          `Error findBySignalIdAndEServiceId: ${error}`
        );
      }
    }
  };
};

export type SignalRepository = typeof signalRepository;
