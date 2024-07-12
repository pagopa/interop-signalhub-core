import { genericInternalError, DB } from "pagopa-signalhub-commons";

export interface ISignalRepository {
  findBy: (signalId: number, eserviceId: string) => Promise<number | null>;
}

export const signalRepository = (db: DB): ISignalRepository => ({
  async findBy(signalId: number, eserviceId: string): Promise<number | null> {
    try {
      return await db.oneOrNone(
        "SELECT signal_id FROM DEV_SIGNALHUB.signal WHERE eservice_id = $1 AND signal_id = $2",
        [eserviceId, signalId]
      );
    } catch (error) {
      throw genericInternalError(`Error findBySignalIdAndEServiceId: ${error}`);
    }
  },
});

export type SignalRepository = typeof signalRepository;
