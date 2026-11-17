import {
  type DB,
  genericInternalError,
  type SignalRecord,
  type TableName
} from "pagopa-signalhub-commons";

import { config } from "../config/env.js";

export interface ISignalRepository {
  getAll: () => Promise<SignalRecord[]>;
}

export const signalRepository = (db: DB): ISignalRepository => {
  const signalTable: TableName = `${config.signalHubSchema}.signal`;

  return {
    async getAll(): Promise<SignalRecord[]> {
      try {
        return await db.any<SignalRecord>(
          `SELECT signal_id, eservice_id, signal_type, tmst_insert FROM ${signalTable}`
        );
      } catch (error) {
        throw genericInternalError(`Error getting signals: ${error}`);
      }
    }
  };
};
