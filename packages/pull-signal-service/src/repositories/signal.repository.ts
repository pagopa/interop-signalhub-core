import { genericInternalError, DB } from "signalhub-commons";

export interface ISignalRepository {
  getByEservice: (
    eserviceId: string,
    fromSignalId: number,
    toSignalIs: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => Promise<any[] | null>;
}

export const signalRepository = (db: DB): ISignalRepository => ({
  async getByEservice(
    eserviceId: string,
    fromSignalId: number,
    toSignalId: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any[] | null> {
    try {
      return await db.any(
        "SELECT * FROM signal WHERE eservice_id = $1 AND signal_id >= $2 order by signal_id asc limit $3",
        [eserviceId, fromSignalId, toSignalId]
      );
    } catch (error) {
      throw genericInternalError(`Error get: ${error}`);
    }
  },
});

export type SignalRepository = typeof signalRepository;
