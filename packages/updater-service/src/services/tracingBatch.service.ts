import { DB, genericInternalError } from "signalhub-commons";
import { ApplicationType } from "../utils/index.js";
import { tracingBatchRepository } from "../repositories/tracingBatch.repository.js";
import { TracingBatchStateEnum } from "../models/domain/model.js";

export function tracingBatchServiceBuilder(db: DB) {
  const tracingBatchRepositoryInstance = tracingBatchRepository(db);
  return {
    async getLastEventIdByTracingBatchAndType(
      applicationType: ApplicationType
    ) {
      try {
        const tracingBatchEntityList =
          await tracingBatchRepositoryInstance.findLatestByType(
            applicationType
          );

        if (tracingBatchEntityList.length <= 0) {
          return 0;
        }

        if (tracingBatchEntityList[0].state == TracingBatchStateEnum.ENDED) {
          return tracingBatchEntityList[0].last_event_id;
        }

        //TODO: Change "1" with env variable
        if (tracingBatchEntityList.length > 1) {
          return (
            tracingBatchEntityList[tracingBatchEntityList.length - 1]
              .last_event_id + 1
          );
        }

        return tracingBatchEntityList[0].last_event_id;
      } catch (error) {
        throw genericInternalError(
          `Error getLastEventIdByTracingBatchAndType:" ${error} `
        );
      }
    },
  };
}
