import { genericError, DB, TableName } from "pagopa-signalhub-commons";
import { config } from "../config/env.js";

export interface IInteropRepository {
  findBy: (
    eserviceId: string,
    purposeId: string,
    eserviceState: string,
    purposeState: string,
    agreementState: string
  ) => Promise<
    Array<{
      eserviceId: string;
      agreementId: string;
      purposeId: string;
    }>
  >;
}

export const interopRepository = (db: DB): IInteropRepository => {
  const eserviceTable: TableName = `${config.interopSchema}.eservice`;
  const agreementTable: TableName = `${config.interopSchema}.agreement`;
  const purposeTable: TableName = `${config.interopSchema}.purpose`;
  return {
    async findBy(
      eserviceId: string,
      consumerId: string,
      eserviceState: string,
      purposeState: string,
      agreementState: string
    ): Promise<
      Array<{
        eserviceId: string;
        agreementId: string;
        purposeId: string;
      }>
    > {
      try {
        return await db.manyOrNone(
          `SELECT
                eservice.eservice_id eserviceId, agreement.agreement_id agreementId, purpose.purpose_id purposeId
           FROM
                ${eserviceTable} eservice, ${agreementTable} agreement, ${purposeTable} purpose
           WHERE
                eservice.eservice_id = $1
           AND  eservice.enabled_signal_hub = true
           AND  eservice.state = $2
           AND  agreement.consumer_id = $3
           AND  agreement.eservice_id = eservice.eservice_id
           AND  UPPER(agreement.state) = UPPER($4)
           AND  purpose.consumer_id = agreement.consumer_id
           AND  purpose.eservice_id = eservice.eservice_id 
           AND  UPPER(purpose.purpose_state) = UPPER($5)`,
          [eserviceId, eserviceState, consumerId, agreementState, purposeState]
        );
      } catch (error: unknown) {
        throw genericError(`Error interopRepository::findBy ${error}`);
      }
    },
  };
};

export type InteropRepository = typeof interopRepository;
