import { genericError, DB, TableName } from "pagopa-signalhub-commons";
import { config } from "../config/env.js";

export interface IEserviceRepository {
  findBy: (
    producerId: string,
    eserviceId: string,
    state: string
  ) => Promise<string | null>;
}

export const eserviceRepository = (db: DB): IEserviceRepository => {
  const eServiceTable: TableName = `${config.signalhubStoreDbNameNamespace}_INTEROP.eservice`;

  return {
    async findBy(
      producerId: string,
      eserviceId: string,
      state: string
    ): Promise<string | null> {
      try {
        return await db.oneOrNone(
          `SELECT eservice_id FROM ${eServiceTable} WHERE producer_id = $1 AND eservice_id = $2 AND state = $3`,
          [producerId, eserviceId, state],
          (rs) => (rs ? rs.eservice_id : null)
        );
      } catch (error: unknown) {
        throw genericError(`Error eserviceRepository::findBy ${error}`);
      }
    },
  };
};

export type EserviceRepository = typeof eserviceRepository;
