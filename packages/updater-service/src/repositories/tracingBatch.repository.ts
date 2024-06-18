import {
  DB,
  TracingBatchDto,
  genericInternalError,
  toTracingBatchDto,
} from "signalhub-commons";
import { TracingBatchStateEnum } from "../models/domain/model.js";
import { ApplicationType } from "../config/env.js";

export interface ITracingBatchRepository {
  findLatestByType: (
    applicationType: ApplicationType
  ) => Promise<TracingBatchDto[]>;

  insert: (
    tracingBatchState: TracingBatchStateEnum,
    lastEventId: number,
    applicationType: ApplicationType
  ) => Promise<void>;
}

export const tracingBatchRepository = (db: DB): ITracingBatchRepository => ({
  async findLatestByType(applicationType): Promise<TracingBatchDto[]> {
    try {
      const response = await db.manyOrNone(
        "SELECT * from TRACING_BATCH where last_event_id = (select MAX(t.last_event_id) from TRACING_BATCH t where t.type = $1) order by tmst_created desc",
        [applicationType]
      );

      return response.map(toTracingBatchDto);
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
