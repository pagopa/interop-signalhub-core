import {
  DB,
  TracingBatch,
  genericInternalError,
  toTracingBatch,
} from "pagopa-signalhub-commons";
import { TracingBatchStateEnum } from "../models/domain/model.js";
import { ApplicationType } from "../config/env.js";

export interface ITracingBatchRepository {
  findLatestByType: (
    applicationType: ApplicationType
  ) => Promise<TracingBatch[]>;

  findAllByStateEndedWithErrorAndLastEventIdAndType: (
    lastEventId: number,
    applicationType: ApplicationType
  ) => Promise<TracingBatch[]>;

  insert: (
    tracingBatchState: TracingBatchStateEnum,
    lastEventId: number,
    applicationType: ApplicationType
  ) => Promise<void>;
}

export const tracingBatchRepository = (db: DB): ITracingBatchRepository => ({
  async findLatestByType(applicationType): Promise<TracingBatch[]> {
    try {
      const response = await db.manyOrNone(
        "SELECT * from DEV_INTEROP.TRACING_BATCH where last_event_id = (select MAX(t.last_event_id) from DEV_INTEROP.TRACING_BATCH t where t.type = $1) order by tmst_created desc",
        [applicationType]
      );

      return response.map(toTracingBatch);
    } catch (error) {
      throw genericInternalError(`Error findLatestByType:" ${error} `);
    }
  },

  async findAllByStateEndedWithErrorAndLastEventIdAndType(
    lastEventId,
    applicationType
  ): Promise<TracingBatch[]> {
    try {
      const response = await db.manyOrNone(
        "SELECT * from DEV_INTEROP.TRACING_BATCH where last_event_id = $1 and state = 'ENDED_WITH_ERROR' and type = $2",
        [lastEventId, applicationType]
      );

      return response.map(toTracingBatch);
    } catch (error) {
      throw genericInternalError(
        `Error findAllByStateEndedWithErrorAndLastEventIdAndType:" ${error} `
      );
    }
  },

  async insert(tracingBatchState, lastEventId, applicationType): Promise<void> {
    try {
      await db.none(
        "INSERT INTO DEV_INTEROP.TRACING_BATCH (last_event_id, state, type) VALUES ($1, $2, $3)",
        [lastEventId, tracingBatchState, applicationType]
      );
    } catch (error) {
      throw genericInternalError(
        `Error insert tracing batch State:" ${error} `
      );
    }
  },
});
