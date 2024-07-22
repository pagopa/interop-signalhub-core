import {
  DB,
  genericInternalError,
  TracingBatchCleanup,
} from "pagopa-signalhub-commons";

export interface ITracingBatchCleanupRepository {
  insert: (tmstStartAt: string) => Promise<number>;
  update: (tracingBatchCleanup: TracingBatchCleanup) => Promise<void>;
}

export const tracingBatchCleanupRepository = (
  db: DB
): ITracingBatchCleanupRepository => ({
  async insert(tmstStartAt: string): Promise<number> {
    try {
      const { batch_id } = await db.one(
        "INSERT INTO DEV_SIGNALHUB.TRACING_BATCH_CLEANUP (tmst_start_at ) VALUES ($1) RETURNING batch_id",
        [tmstStartAt]
      );
      return batch_id;
    } catch (error) {
      throw genericInternalError(
        `Error insert tracing batch State:" ${error} `
      );
    }
  },
  async update(tracingBatchCleanup: TracingBatchCleanup): Promise<void> {
    try {
      const { batchId, tmstEndAt, error, tmstDeleteFrom, countDeleted } =
        tracingBatchCleanup;
      await db.none(
        "UPDATE DEV_SIGNALHUB.TRACING_BATCH_CLEANUP SET tmst_end_at = $1, error = $2, tmst_delete_from = $3, count_deleted = $4 WHERE batch_id = $5",
        [tmstEndAt, error, tmstDeleteFrom, countDeleted, batchId]
      );
    } catch (error) {
      throw genericInternalError(
        `Error update tracing batch State:" ${error} `
      );
    }
  },
});
