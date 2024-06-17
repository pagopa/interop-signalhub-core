/* eslint-disable functional/no-method-signature */
import { DB, genericInternalError } from "signalhub-commons";
import {
  TracingBatchEntity,
  TracingBatchStateEnum,
} from "../models/domain/model.js";
import { ApplicationType } from "../config/env.js";

export interface ITracingBatchRepository {
  findLatestByType(
    applicationType: ApplicationType
  ): Promise<TracingBatchEntity[]>;

  insert(
    tracingBatchState: TracingBatchStateEnum,
    lastEventId: number,
    applicationType: ApplicationType
  ): Promise<void>;
}

export const tracingBatchRepository = (db: DB): ITracingBatchRepository => ({
  async findLatestByType(applicationType): Promise<TracingBatchEntity[]> {
    try {
      return (await db.oneOrNone(
        "SELECT trace from TRACING_BATCH trace where trace.last_event_id = (select MAX(t.last_event_id) from TRACING_BATCH t where t.type = $1) order by trace.tmst_created desc",
        [applicationType]
      )) as TracingBatchEntity[];
    } catch (error) {
      throw genericInternalError(`Error findLatestByType:" ${error} `);
    }
  },

  async insert(tracingBatchState, lastEventId, applicationType): Promise<void> {
    try {
      await db.none(
        "INSERT INTO TRACING_BATCH (last_event_id, state, type) VALUES ($1, $2, $3)",
        [lastEventId, tracingBatchState, applicationType]
      );
    } catch (error) {
      throw genericInternalError(
        `Error insert tracing batch State:" ${error} `
      );
    }
  },
});
