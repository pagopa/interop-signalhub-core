import { genericInternalError, DB, SignalRecord } from "signalhub-commons";

export interface ISignalRepository {
  getByEservice: (
    eserviceId: string,
    signalId: number,
    limit: number
  ) => Promise<SignalRecord[] | null>;
  getNextSignalId: (
    eserviceId: string,
    signalId: number | null
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
        "SELECT signal_id, object_id, eservice_id, object_type, signal_type FROM DEV_SIGNALHUB.signal s WHERE s.eservice_id = $1 AND s.signal_id > $2 order by s.signal_id asc limit $3",
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
        "SELECT signal_id FROM DEV_SIGNALHUB.signal s WHERE s.eservice_id = $1 AND s.signal_id > $2 order by s.signal_id asc limit 1",
        [eserviceId, lastReadSignalId],
        // leave this rule disabled
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        (item) => item && item.signal_id
      );
    } catch (error) {
      throw genericInternalError(`Error get: ${error}`);
    }
  },
});

export type SignalRepository = typeof signalRepository;
