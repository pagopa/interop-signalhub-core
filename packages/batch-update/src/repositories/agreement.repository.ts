/* eslint-disable functional/no-method-signature */
import {
  Agreement,
  DB,
  genericInternalError,
  toAgreement,
} from "pagopa-signalhub-commons";
import { getCurrentDate } from "../utils.js";

export interface IAgreementRepository {
  findByEserviceIdAndConsumerIdAndDescriptorId(
    eserviceId: string,
    consumerId: string,
    descriptorId: string
  ): Promise<Agreement | null>;

  insertAgreement(
    agreementId: string,
    eserviceId: string,
    consumerId: string,
    descriptorId: string,
    eventId: number,
    state: string
  ): Promise<Agreement>;

  updateAgreement(
    eserviceId: string,
    consumerId: string,
    descriptorId: string,
    state: string
  ): Promise<Agreement>;
}

export const agreementRepository = (db: DB): IAgreementRepository => ({
  async findByEserviceIdAndConsumerIdAndDescriptorId(
    eserviceId,
    consumerId,
    descriptorId
  ): Promise<Agreement | null> {
    try {
      const response = await db.oneOrNone(
        "select * from dev_interop.agreement consumer where consumer.eservice_id = $1 AND consumer.consumer_id = $2  AND consumer.descriptor_id = $3",
        [eserviceId, consumerId, descriptorId]
      );

      if (!response) {
        return null;
      }

      return toAgreement(response);
    } catch (error) {
      throw genericInternalError(
        `Error findByEserviceIdAndConsumerIdAndDescriptorId:" ${error} `
      );
    }
  },

  // eslint-disable-next-line max-params
  async insertAgreement(
    agreementId: string,
    eserviceId: string,
    consumerId: string,
    descriptorId: string,
    eventId: number,
    state: string
  ): Promise<Agreement> {
    try {
      const response = await db.oneOrNone(
        "INSERT INTO dev_interop.agreement(agreement_id,eservice_id, consumer_id, descriptor_id, event_id,state) VALUES($1, $2, $3, $4, $5,$6) RETURNING *",
        [agreementId, eserviceId, consumerId, descriptorId, eventId, state]
      );

      return toAgreement(response);
    } catch (error) {
      throw genericInternalError(`Error insertConsumerEservice:" ${error} `);
    }
  },

  async updateAgreement(
    eserviceId: string,
    consumerId: string,
    descriptorId: string,
    state: string
  ): Promise<Agreement> {
    try {
      const tmstLastEdit = getCurrentDate();

      const response = await db.oneOrNone(
        "update dev_interop.agreement set state = $1, tmst_last_edit= $2  where eservice_id = $3 AND descriptor_id = $4 AND consumer_id= $5 RETURNING *",
        [state, tmstLastEdit, eserviceId, descriptorId, consumerId]
      );

      return toAgreement(response);
    } catch (error) {
      throw genericInternalError(`Error updateConsumerEservice:" ${error} `);
    }
  },
});
