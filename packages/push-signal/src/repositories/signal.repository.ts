import { DB, TableName, genericInternalError } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";

export interface ISignalRepository {
  findBy: (signalId: number, eserviceId: string) => Promise<number | null>;
  findSignalsWithSignalIdMajorThanAndAlreadyStored: (
    eserviceId: string,
    signalId: number,
    consolidationTimeWindowInSeconds: number
  ) => Promise<number[] | null>;
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
    },

    async findSignalsWithSignalIdMajorThanAndAlreadyStored(
      eserviceId: string,
      signalId: number,
      consolidationTimeWindowInSeconds: number
    ): Promise<number[] | null> {
      try {
        return await db.manyOrNone(
          `WITH now_once AS (
            SELECT NOW() - INTERVAL '${consolidationTimeWindowInSeconds} seconds' AS cutoff_time
          )
          SELECT signal_id FROM ${signalTable}, now_once
           WHERE eservice_id = $1
           AND signal_id > $2
           AND tmst_insert < cutoff_time`,
          [eserviceId, signalId]
        );
      } catch (error) {
        throw genericInternalError(
          `Error findSignalsWithSignalIdMajorThanAndAlreadyStored: ${error}`
        );
      }
    }
  };
};

export type SignalRepository = typeof signalRepository;
