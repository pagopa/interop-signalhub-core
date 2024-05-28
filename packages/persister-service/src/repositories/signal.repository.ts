import { genericInternalError } from "signalhub-commons";
import { Signal } from "../models/domain/models.js";
import { DB } from "./db.js";

export interface ISignalRepository {
  insertSignal: (signal: Signal) => Promise<number | null>;
}

export const signalRepository = (db: DB): ISignalRepository => ({
  async insertSignal(signal): Promise<number | null> {
    try {
      return await db.oneOrNone(
        "INSERT INTO SIGNAL(correlation_id, signal_id,object_id,eservice_id, object_type, signal_type, tmst_insert) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id",
        [
          signal.correlationId,
          signal.signalId,
          signal.objectId,
          signal.eserviceId,
          signal.objectType,
          signal.signalType,
          signal.tmstInsert,
        ],
        (rec) => rec.id
      );
    } catch (error) {
      throw genericInternalError(`Error: ${error}`);
    }
  },
});

export type SignalRepository = typeof signalRepository;
