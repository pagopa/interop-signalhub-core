import { DB, TableName, genericInternalError } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";
import { AgreementEntity } from "../models/domain/model.js";

export interface IAgreementRepository {
  readonly delete: (agreementId: string, streamId: string) => Promise<void>;
  readonly eventWasProcessed: (
    streamId: string,
    version: number
  ) => Promise<boolean>;
  readonly insert: (agreement: AgreementEntity) => Promise<void>;
  readonly update: (agreement: AgreementEntity) => Promise<void>;
}

export const agreementRepository = (db: DB): IAgreementRepository => {
  const agreementTable: TableName = `${config.interopSchema}.agreement`;
  return {
    async eventWasProcessed(streamId, versionId): Promise<boolean> {
      try {
        const response = await db.oneOrNone(
          `select event_stream_id, event_version_id from ${agreementTable} a where a.event_stream_id = $1 AND a.event_version_id >= $2`,
          [streamId, versionId]
        );
        return response ? true : false;
      } catch (error) {
        throw genericInternalError(`Error eventWasProcessed:" ${error} `);
      }
    },

    async insert(agreement: AgreementEntity): Promise<void> {
      const {
        agreement_id,
        eservice_id,
        consumer_id,
        descriptor_id,
        state,
        event_stream_id,
        event_version_id,
        delegation_id
      } = agreement;
      try {
        await db.oneOrNone(
          `INSERT INTO ${agreementTable}(agreement_id, eservice_id, consumer_id, descriptor_id, state, event_stream_id, event_version_id,delegation_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            agreement_id,
            eservice_id,
            consumer_id,
            descriptor_id,
            state,
            event_stream_id,
            event_version_id,
            delegation_id
          ]
        );
      } catch (error) {
        throw genericInternalError(
          `Error insertAgreement: id: ${agreement_id}, eservice_id: ${eservice_id}, consumer_id: ${consumer_id}, descriptor_id: ${descriptor_id}, state: ${state}, event_stream_id: ${event_stream_id}, event_version_id: ${event_version_id} -  ${error} `
        );
      }
    },

    async update(agreement: AgreementEntity): Promise<void> {
      const tmstLastEdit = getCurrentDate();
      const {
        agreement_id,
        eservice_id,
        consumer_id,
        descriptor_id,
        state,
        event_stream_id,
        event_version_id
      } = agreement;
      try {
        await db.none(
          `update ${agreementTable} set agreement_id = $1, eservice_id = $2, consumer_id = $3, descriptor_id = $4, state = $5, event_stream_id = $6, event_version_id =$7, tmst_last_edit = $8  where agreement_id = $1 and event_stream_id = $6`,
          [
            agreement_id,
            eservice_id,
            consumer_id,
            descriptor_id,
            state,
            event_stream_id,
            event_version_id,
            tmstLastEdit
          ]
        );
      } catch (error) {
        throw genericInternalError(
          `Error updateAgreement: id: ${agreement_id}, eservice_id: ${eservice_id}, consumer_id: ${consumer_id}, descriptor_id: ${descriptor_id}, state: ${state}, event_stream_id: ${event_stream_id}, event_version_id: ${event_version_id} -  ${error} `
        );
      }
    },
    async delete(agreementId: string, streamId: string): Promise<void> {
      await db.none(
        `delete from ${agreementTable} where agreement_id = $1 and event_stream_id = $2`,
        [agreementId, streamId]
      );
    }
  };
};

function getCurrentDate(): string {
  return new Date().toISOString();
}
