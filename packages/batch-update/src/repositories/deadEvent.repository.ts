import { DB, genericInternalError } from "signalhub-commons";
import { DeadEvent } from "../models/domain/model.js";

export interface IDeadEventRepository {
  insertDeadEvent: (deadEvent: DeadEvent) => Promise<void>;
}

export const deadEventRepository = (db: DB): IDeadEventRepository => ({
  async insertDeadEvent(deadEvent): Promise<void> {
    try {
      await db.none(
        "INSERT INTO DEV_INTEROP.DEAD_EVENT (event_id,agreement_id,eservice_id, descriptor_id,tmst_insert, error_reason,event_type, object_type) VALUES ($1, $2, $3, $4, $5, $6, $7,$8)",
        [
          deadEvent.eventId,
          deadEvent.agreementId,
          deadEvent.eserviceId,
          deadEvent.descriptorId,
          deadEvent.tmstInsert,
          deadEvent.errorReason,
          deadEvent.eventType,
          deadEvent.objectType,
        ]
      );
    } catch (error) {
      throw genericInternalError(`Error insert dead event:" ${error}`);
    }
  },
});
