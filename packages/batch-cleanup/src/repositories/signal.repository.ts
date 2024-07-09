import { genericInternalError, DB } from "signalhub-commons";

export interface ISignalRepository {
  deleteBy: (date: Date) => Promise<number | null>;
}

export const signalRepository = (db: DB): ISignalRepository => ({
  async deleteBy(datetimeInThePast: Date): Promise<number | null> {
    try {
      return await db.result(
        "DELETE from dev_signalhub.signal WHERE tmst_insert <= $1",
        [datetimeInThePast],
        (result) => result.rowCount
      );
    } catch (error) {
      throw genericInternalError(`Error deleting signals: ${error}`);
    }
  },
});

export type SignalRepository = typeof signalRepository;
