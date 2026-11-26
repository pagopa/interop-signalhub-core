import {
  type DB,
  genericInternalError,
  type SignalRecord,
  type TableName
} from "pagopa-signalhub-commons";

import { config } from "../config/env.js";

export interface ISignalRepository {
  forEachChunk: (
    chunkSize: number,
    onChunk: (records: SignalRecord[]) => Promise<void>
  ) => Promise<void>;
}

export const signalRepository = (db: DB): ISignalRepository => {
  const signalTable: TableName = `${config.signalHubSchema}.signal`;
  const { TransactionMode } = db.$config.pgp.txMode;

  return {
    async forEachChunk(chunkSize, onChunk): Promise<void> {
      try {
        await db.tx(
          { mode: new TransactionMode({ readOnly: true }) },
          async (t) => {
            await t.none(
              `DECLARE signal_cursor NO SCROLL CURSOR FOR SELECT signal_id, eservice_id, signal_type, tmst_insert FROM ${signalTable}`
            );
            const fetchChunk = (): Promise<SignalRecord[]> =>
              t.any<SignalRecord>("FETCH $1 FROM signal_cursor", [chunkSize]);
            for (
              let records = await fetchChunk();
              records.length > 0;
              records = await fetchChunk()
            ) {
              await onChunk(records);
            }
          }
        );
      } catch (error) {
        throw genericInternalError(`Error exporting signals: ${error}`);
      }
    }
  };
};
