import { genericInternalError, DB, TableName } from "pagopa-signalhub-commons";
import { config } from "../config/env.js";

export interface ISignalRepository {
  deleteBy: (date: Date) => Promise<number | null>;
}

export const signalRepository = (db: DB): ISignalRepository => {
  const signalTable: TableName = `${config.signalHubSchema}.signal`;

  return {
    async deleteBy(datetimeInThePast: Date): Promise<number> {
      try {
        return await db.result(
          `DELETE from ${signalTable} WHERE tmst_insert <= $1`,
          [datetimeInThePast],
          (result) => result.rowCount
        );
      } catch (error) {
        throw genericInternalError(`Error deleting signals: ${error}`);
      }
    },
  };
};

export type SignalRepository = typeof signalRepository;
