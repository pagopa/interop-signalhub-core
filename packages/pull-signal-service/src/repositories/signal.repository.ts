import { genericInternalError, DB } from "signalhub-commons";

export interface ISignalRepository {
  getByEservice: (
    eserviceId: string,
    signalId: number,
    limit: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => Promise<any[] | null>;
  getNextSignalId: (
    eserviceId: string,
    signalId: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => Promise<any | null>;
}

export const signalRepository = (db: DB): ISignalRepository => ({
  async getByEservice(
    eserviceId: string,
    signalId: number,
    limit: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any[] | null> {
    try {
      return await db.any(
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any | null> {
    try {
      return await db.oneOrNone(
        "SELECT signal_id FROM signal WHERE eservice_id = $1 AND signal_id > $2 limit 1",
        [eserviceId, signalId]
      );
    } catch (error) {
      throw genericInternalError(`Error get: ${error}`);
    }
  },
});

export type SignalRepository = typeof signalRepository;
