import { genericError, DB, TableName } from "pagopa-signalhub-commons";
import { config } from "../config/env.js";

export interface IAgreementRepository {
  findBy: (
    consumerId: string,
    eserviceId: string,
    state: string
  ) => Promise<string | null>;
}

export const agreementRepository = (db: DB): IAgreementRepository => {
  const agreementTable: TableName = `${config.signalhubStoreDbNameNamespace}_INTEROP.agreement`;

  return {
    async findBy(
      consumerId: string,
      eserviceId: string,
      state: string
    ): Promise<string | null> {
      try {
        return await db.oneOrNone(
          `SELECT consumer_id FROM ${agreementTable} c WHERE c.consumer_id = $1 AND c.eservice_id = $2 AND c.state = $3`,
          [consumerId, eserviceId, state]
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        throw genericError(`Error eserviceRepository::findBy ${error.code}`);
      }
    },
  };
};

export type agreementRepository = typeof agreementRepository;
