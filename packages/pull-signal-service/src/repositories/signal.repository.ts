import { genericInternalError, DB, SignalRecord } from "signalhub-commons";

export interface ISignalRepository {
  getByEservice: (
    eserviceId: string,
    signalId: number,
    limit: number
  ) => Promise<SignalRecord[] | null>;
  getNextSignalId: (
    eserviceId: string,
    signalId: number
  ) => Promise<number | null>;
}

export const signalRepository = (db: DB): ISignalRepository => ({
  async getByEservice(
    eserviceId: string,
    signalId: number,
    limit: number
  ): Promise<SignalRecord[] | null> {
    try {
      return await db.any<SignalRecord[]>(
        "SELECT signal_id, object_id, eservice_id, object_type, signal_type FROM signal WHERE eservice_id = $1 AND signal_id > $2 order by signal_id asc limit $3",
        [eserviceId, signalId, limit]
      );
    } catch (error) {
      throw genericInternalError(`Error get: ${error}`);
    }
  },
  async getNextSignalId(
    eserviceId: string,
    signalId: number
  ): Promise<number | null> {
    try {
      return await db.oneOrNone<number>(
        "SELECT signal_id FROM signal WHERE eservice_id = $1 AND signal_id > $2 limit 1",
        [eserviceId, signalId]
      );
    } catch (error) {
      throw genericInternalError(`Error get: ${error}`);
    }
  },
});

export type SignalRepository = typeof signalRepository;
