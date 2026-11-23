import { DB, genericInternalError, TableName } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";

export interface ISignalRepository {
  findFirstMatchingSignalId: (
    eserviceId: string,
    signalId: number,
    consolidationTimeWindowInSeconds: number | null
  ) => Promise<string | null>;
}

export const signalRepository = (db: DB): ISignalRepository => {
  const signalTable: TableName = `${config.signalHubSchema}.signal`;

  return {
    async findFirstMatchingSignalId(
      eserviceId: string,
      signalId: number,
      consolidationTimeWindowInSeconds: number | null
    ): Promise<string | null> {
      try {
        const row = await db.oneOrNone<{ signal_id: string }>(
          `SELECT signal_id
           FROM ${signalTable}
           WHERE eservice_id = $1
           AND signal_id >= $2
           AND (signal_id = $2 OR tmst_insert < NOW() - $3 * INTERVAL '1 second')
           ORDER BY signal_id
           LIMIT 1`,
          [eserviceId, signalId, consolidationTimeWindowInSeconds]
        );
        return row?.signal_id ?? null;
      } catch (error) {
        throw genericInternalError(
          `Error signalRepository::findFirstMatchingSignalId: ${error}`
        );
      }
    }
  };
};

export type SignalRepository = typeof signalRepository;
