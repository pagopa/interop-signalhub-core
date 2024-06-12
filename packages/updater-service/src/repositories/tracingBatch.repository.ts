import { DB, genericInternalError } from "signalhub-commons";
import { TracingBatchEntity } from "../models/domain/model.js";
import { ApplicationType } from "../utils/index.js";

export interface ITracingBatchRepository {
  findLatestByType(
    applicationType: ApplicationType
  ): Promise<Array<TracingBatchEntity>>;
}

export const tracingBatchRepository = (db: DB): ITracingBatchRepository => ({
  async findLatestByType(applicationType) {
    try {
      return (await db.oneOrNone(
        "SELECT trace from TRACING_BATCH trace where trace.last_event_id = (select MAX(t.last_event_id) from TRACING_BATCH t where t.type = $1) order by trace.tmst_created desc",
        [applicationType]
      )) as Array<TracingBatchEntity>;
    } catch (error) {
      throw genericInternalError(`Error findLatestByType:" ${error} `);
    }
  },
});
