import { genericInternalError } from "signalhub-commons";
import { DB } from "./db.js";

export interface ISignalHubRepository {
  findBySignalIdAndEServiceId: (
    signalId: number,
    eserviceId: string
  ) => Promise<number | null>;
}

export const signalHubRepository = (db: DB): ISignalHubRepository => ({
  async findBySignalIdAndEServiceId(
    signalId: number,
    eserviceId: string
  ): Promise<number | null> {
    try {
      return await db.oneOrNone(
        "SELECT signal_id FROM SIGNAL WHERE eservice_id = $1 AND signal_id = $2",
        [eserviceId, signalId]
      );
    } catch (error) {
      throw genericInternalError(`Error findBySignalIdAndEServiceId: ${error}`);
    }
  },
});

export type SignalHubRepository = typeof signalHubRepository;
