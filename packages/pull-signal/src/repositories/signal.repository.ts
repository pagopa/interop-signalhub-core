import {
  DB,
  SignalRecord,
  TableName,
  genericInternalError
} from "pagopa-signalhub-commons";

import { config } from "../config/env.js";

export interface ISignalRepository {
  getByEservice: (
    eserviceId: string,
    signalId: number,
    limit: number
  ) => Promise<SignalRecord[] | null>;
  getByEserviceByTimeWindow: (
    eserviceId: string,
    signalId: number,
    limit: number,
    timeWindowInSeconds: number
  ) => Promise<SignalRecord[] | null>;
  getNextSignalId: (
    eserviceId: string,
    signalId: number | null
  ) => Promise<number | null>;
}

export const signalRepository = (db: DB): ISignalRepository => {
  const signalTable: TableName = `${config.signalHubSchema}.signal`;

  return {
    async getByEservice(
      eserviceId: string,
      signalId: number,
      limit: number
    ): Promise<SignalRecord[] | null> {
      try {
        return await db.any<SignalRecord[]>(
          `SELECT signal_id, object_id, eservice_id, object_type, signal_type FROM ${signalTable} s 
           WHERE s.eservice_id = $1 
           AND s.signal_id > $2 
           order by s.signal_id asc limit $3`,
          [eserviceId, signalId, limit]
        );
      } catch (error) {
        throw genericInternalError(`Error get: ${error}`);
      }
    },
    async getByEserviceByTimeWindow(
      eserviceId: string,
      signalId: number,
      limit: number,
      timeWindowInSeconds: number
    ): Promise<SignalRecord[] | null> {
      try {
        return await db.any<SignalRecord[]>(
          `WITH now_once AS (
            SELECT NOW() - INTERVAL '${timeWindowInSeconds} seconds' AS cutoff_time
          )
          SELECT signal_id, object_id, eservice_id, object_type, signal_type FROM ${signalTable} s, now_once
           WHERE s.eservice_id = $1 
           AND s.signal_id > $2 
           AND s.tmst_insert < cutoff_time
           order by s.signal_id asc limit $3`,
          [eserviceId, signalId, limit]
        );
      } catch (error) {
        throw genericInternalError(`Error get: ${error}`);
      }
    },
    async getNextSignalId(
      eserviceId: string,
      lastReadSignalId: number | null
    ): Promise<number | null> {
      if (!lastReadSignalId) {
        return null;
      }
      try {
        return await db.oneOrNone<number>(
          `SELECT signal_id FROM ${signalTable} s WHERE s.eservice_id = $1 AND s.signal_id > $2 order by s.signal_id asc limit 1`,
          [eserviceId, lastReadSignalId],
          // leave this rule disabled

          (item) => item && item.signal_id
        );
      } catch (error) {
        throw genericInternalError(`Error get: ${error}`);
      }
    }
  };
};

export type SignalRepository = typeof signalRepository;
