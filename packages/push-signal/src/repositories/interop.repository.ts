import { genericError, DB, TableName } from "pagopa-signalhub-commons";
import { config } from "../config/env.js";

export interface IInteropRepository {
  findBy: (
    eserviceId: string,
    producerId: string,
    eserviceAllowedStates: string[]
  ) => Promise<string[] | null>;
}

export const interopRepository = (db: DB): IInteropRepository => {
  const eserviceTable: TableName = `${config.interopSchema}.eservice`;
  return {
    async findBy(
      eserviceId: string,
      producerId: string,
      eserviceAllowedStates: string[]
    ): Promise<string[] | null> {
      try {
        const sqlConditionStates = eserviceAllowedStates
          .map((eServiceState) => `UPPER(state) = UPPER('${eServiceState}')`)
          .join(" OR ");

        return await db.manyOrNone(
          `SELECT eservice_id 
           FROM ${eserviceTable} 
           WHERE eservice_id = $1 and producer_id = $2
           AND (${sqlConditionStates}) 
           AND enabled_signal_hub IS TRUE`,
          [eserviceId, producerId]
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
