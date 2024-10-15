import { genericError, DB, TableName } from "pagopa-signalhub-commons";
import { config } from "../config/env.js";

export interface IInteropRepository {
  findByEserviceIdAndProducerId: (
    eserviceId: string,
    producerId: string,
    state: string
  ) => Promise<string | null>;
}

export const interopRepository = (db: DB): IInteropRepository => {
  const eserviceTable: TableName = `${config.interopSchema}.eservice`;
  return {
    async findByEserviceIdAndProducerId(
      eserviceId: string,
      producerId: string,
      state: string
    ): Promise<string | null> {
      try {
        return await db.oneOrNone(
          `select eservice_id from ${eserviceTable} where eservice_id = $1 and producer_id = $2 and UPPER(state) = UPPER($3) and enabled_signal_hub IS TRUE`,
          [eserviceId, producerId, state]
        );
      } catch (error: unknown) {
        throw genericError(
          `Error interopRepository::findByEserviceIdAndProducerId ${error}`
        );
      }
    },
  };
};

export type InteropRepository = typeof interopRepository;
