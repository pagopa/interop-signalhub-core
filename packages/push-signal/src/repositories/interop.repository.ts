import { DB, TableName, genericError } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";

export interface IInteropRepository {
  findBy: (
    eserviceId: string,
    producerId: string,
    eserviceAllowedStates: string[]
  ) => Promise<string[]>;
}

export const interopRepository = (db: DB): IInteropRepository => {
  const eserviceTable: TableName = `${config.interopSchema}.eservice`;
  return {
    async findBy(
      eserviceId: string,
      producerId: string,
      //eslint-disable-next-line
      _eserviceAllowedStates: string[]
    ): Promise<string[]> {
      try {
        // const sqlConditionStates = eserviceAllowedStates
        //   .map((eServiceState) => `UPPER(state) = UPPER('${eServiceState}')`)
        //   .join(" OR ");

        return await db.manyOrNone(
          `SELECT eservice_id 
           FROM ${eserviceTable} 
           WHERE eservice_id = $1 and producer_id = $2
           `,
          [eserviceId, producerId]
        );
      } catch (error: unknown) {
        throw genericError(
          `Error interopRepository::findByEserviceIdAndProducerId ${error}`
        );
      }
    }
  };
};

export type InteropRepository = typeof interopRepository;
