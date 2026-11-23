import { DB, genericError, TableName } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";

export interface IInteropRepository {
  hasEnabledDescriptor: (
    eserviceId: string,
    producerId: string,
    allowedStates: readonly string[]
  ) => Promise<boolean>;
}

export const interopRepository = (db: DB): IInteropRepository => {
  const eserviceTable: TableName = `${config.interopSchema}.eservice`;
  return {
    async hasEnabledDescriptor(
      eserviceId: string,
      producerId: string,
      allowedStates: readonly string[]
    ): Promise<boolean> {
      try {
        const { found } = await db.one<{ found: boolean }>(
          `SELECT EXISTS (
             SELECT 1 FROM ${eserviceTable}
             WHERE eservice_id = $1 AND producer_id = $2
             AND enabled_signal_hub IS TRUE
             AND UPPER(state) = ANY($3::text[])
           ) AS found`,
          [eserviceId, producerId, allowedStates]
        );
        return found;
      } catch (error: unknown) {
        throw genericError(
          `Error interopRepository::hasEnabledDescriptor ${error}`
        );
      }
    }
  };
};

export type InteropRepository = typeof interopRepository;
