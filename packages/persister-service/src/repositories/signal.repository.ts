import { Signal, DB } from "signalhub-commons";

export interface ISignalRepository {
  insertSignal: (signal: Signal) => Promise<number | null>;
  getSignalById: (
    signalId: number,
    eserviceId: string
  ) => Promise<number | null>;
}

export const signalRepository = (db: DB): ISignalRepository => ({
  async insertSignal(signal): Promise<number | null> {
    return await db.oneOrNone(
      "INSERT INTO SIGNAL(correlation_id, signal_id,object_id,eservice_id, object_type, signal_type) VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
      [
        signal.correlationId,
        signal.signalId,
        signal.objectId,
        signal.eserviceId,
        signal.objectType,
        signal.signalType,
      ],
      (rec) => rec.id
    );
  },

  async getSignalById(
    signalId: number,
    eserviceId: string
  ): Promise<number | null> {
    return await db.oneOrNone(
      "SELECT signal_id FROM signal WHERE eservice_id = $1 AND signal_id = $2",
      [eserviceId, signalId]
    );
  },
});

export type SignalRepository = typeof signalRepository;
