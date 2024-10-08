import { genericError, DB, TableName } from "pagopa-signalhub-commons";
import { config } from "../config/env.js";

export interface IInteropRepository {
  findBy: (
    eserviceId: string,
    purposeId: string,
    purposeState: string,
    eserviceState: string
  ) => Promise<{
    eservice?: { id: string; state: string; producerId: string };
  } | null>;
}

export const interopRepository = (db: DB): IInteropRepository => {
  const eserviceTable: TableName = `${config.interopSchema}.eservice`;
  const purposeTable: TableName = `${config.interopSchema}.purpose`;
  return {
    async findBy(
      eserviceId: string,
      purposeId: string,
      purposeState: string,
      eserviceState: string
    ): Promise<{
      eservice?: { id: string; state: string; producerId: string };
    } | null> {
      try {
        return await db.oneOrNone(
          `select eservice.eservice_id, eservice.state, eservice.producer_id from ${purposeTable} purpose, ${eserviceTable} eservice where purpose.consumer_id = eservice.producer_id and eservice.eservice_id = $1 and purpose.purpose_id = $2 and UPPER(purpose.purpose_state) = UPPER($3) and UPPER(eservice.state) = UPPER($4)`,
          [eserviceId, purposeId, purposeState, eserviceState]
        );
      } catch (error: unknown) {
        throw genericError(`Error interopRepository::findBy ${error}`);
      }
    },
  };
};

export type InteropRepository = typeof interopRepository;
