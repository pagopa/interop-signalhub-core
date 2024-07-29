/* eslint-disable functional/no-method-signature */
import { DB, genericInternalError } from "pagopa-signalhub-commons";
import { AgreementEntity } from "../models/domain/model.js";

export interface IAgreementRepository {
  eventWasProcessed(streamId: string, version: number): Promise<boolean>;
  insert(agreement: AgreementEntity): Promise<void>;
  update(agreement: AgreementEntity): Promise<void>;
  delete(agreementId: string, streamId: string): Promise<void>;
}

export const agreementRepository = (db: DB): IAgreementRepository => ({
  async eventWasProcessed(streamId, consumerId): Promise<boolean> {
    try {
      const response = await db.oneOrNone(
        "select event_stream_id, event_version_id from dev_interop.agreement a where a.event_stream_id = $1 AND a.event_version_id = $2",
        [streamId, consumerId]
      );
      return response ? true : false;
    } catch (error) {
      throw genericInternalError(
        `Error findByEserviceIdAndConsumerIdAndDescriptorId:" ${error} `
      );
    }
  },

  // eslint-disable-next-line max-params
  async insert(agreement: AgreementEntity): Promise<void> {
    try {
      const {
        agreement_id,
        eservice_id,
        consumer_id,
        descriptor_id,
        state,
        event_stream_id,
        event_version_id,
      } = agreement;
      await db.oneOrNone(
        "INSERT INTO dev_interop.agreement(agreement_id, eservice_id, consumer_id, descriptor_id, state, event_stream_id, event_version_id) VALUES($1, $2, $3, $4, $5, $6, $7)",
        [
          agreement_id,
          eservice_id,
          consumer_id,
          descriptor_id,
          state,
          event_stream_id,
          event_version_id,
        ]
      );
    } catch (error) {
      throw genericInternalError(`Error insertAgreement:" ${error} `);
    }
  },

  async update(agreement: AgreementEntity): Promise<void> {
    try {
      const tmstLastEdit = getCurrentDate();
      const {
        agreement_id,
        eservice_id,
        consumer_id,
        descriptor_id,
        state,
        event_stream_id,
        event_version_id,
      } = agreement;
      await db.one(
        "update dev_interop.agreement set agreement_id = $1, eservice_id = $2, consumer_id = $3, descriptor_id = $4, state = $5, event_stream_id = $6, event_version_id =$7, tmst_last_edit = $8  where agreement_id = $1 and event_stream_id = $6",
        [
          agreement_id,
          eservice_id,
          consumer_id,
          descriptor_id,
          state,
          event_stream_id,
          event_version_id,
          tmstLastEdit,
        ]
      );
    } catch (error) {
      throw genericInternalError(`Error updateAgreement:" ${error} `);
    }
  },
  async delete(agreementId: string, streamId: string): Promise<void> {
    await db.one(
      "delete from dev_interop.agreement where agreement_id = $1 and event_stream_id = $2",
      [agreementId, streamId]
    );
  },
});

function getCurrentDate(): string {
  return new Date().toISOString();
}
