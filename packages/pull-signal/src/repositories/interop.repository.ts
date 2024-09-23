import { genericError, DB, TableName } from "pagopa-signalhub-commons";
import { config } from "../config/env.js";

export interface IInteropRepository {
  findBy: (
    eserviceId: string,
    purposeId: string,
    purposeState: string,
    agreementState: string
  ) => Promise<{
    agreement?: { id: string; state: string; consumerId: string };
  } | null>;
}

export const interopRepository = (db: DB): IInteropRepository => {
  const agreementTable: TableName = `${config.interopSchema}.agreement`;
  const purposeTable: TableName = `${config.interopSchema}.purpose`;
  return {
    async findBy(
      eserviceId: string,
      purposeId: string,
      purposeState: string,
      agreementState: string
    ): Promise<{
      agreement?: { id: string; state: string; consumerId: string };
    } | null> {
      try {
        return await db.oneOrNone(
          `select agreement.agreement_id, agreement.state, agreement.consumer_id from ${purposeTable} purpose, ${agreementTable} agreement where purpose.consumer_id = agreement.consumer_id and agreement.eservice_id = $1 and purpose.purpose_id = $2 and UPPER(purpose.purpose_state) = UPPER($3) and UPPER(agreement.state) = UPPER($4)`,
          [eserviceId, purposeId, purposeState, agreementState]
        );
      } catch (error: unknown) {
        throw genericError(`Error interopRepository::findBy ${error}`);
      }
    },
  };
};

export type InteropRepository = typeof interopRepository;
