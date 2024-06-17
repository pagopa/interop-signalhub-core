import { DB, genericInternalError } from "signalhub-commons";
import { tracingBatchRepository } from "../repositories/tracingBatch.repository.js";
import { TracingBatchStateEnum } from "../models/domain/model.js";
import { ApplicationType, config } from "../config/env.js";
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function tracingBatchServiceBuilder(db: DB) {
  const tracingBatchRepositoryInstance = tracingBatchRepository(db);
  return {
    async getLastEventIdByTracingBatchAndType(
      applicationType: ApplicationType
    ): Promise<number> {
      try {
        const tracingBatchEntityList =
          await tracingBatchRepositoryInstance.findLatestByType(
            applicationType
          );

        if (!tracingBatchEntityList || tracingBatchEntityList.length <= 0) {
          return 0;
        }

        if (tracingBatchEntityList[0].state === TracingBatchStateEnum.ENDED) {
          return parseInt(tracingBatchEntityList[0].last_event_id, 10);
        }

        if (tracingBatchEntityList.length > config.attemptEvent) {
          return (
            parseInt(
              tracingBatchEntityList[tracingBatchEntityList.length - 1]
                .last_event_id,
              10
            ) + 1
          );
        }

        return parseInt(tracingBatchEntityList[0].last_event_id, 10);
      } catch (error) {
        throw genericInternalError(
          `Error getLastEventIdByTracingBatchAndType:" ${error} `
        );
      }
    },

    async terminateTracingBatch(
      tracingBatchState: TracingBatchStateEnum,
      lastEventId: number,
      applicationType: ApplicationType
    ): Promise<number> {
      await tracingBatchRepositoryInstance.insert(
        tracingBatchState,
        lastEventId,
        applicationType
      );
      return lastEventId;
    },
  };
}

export type TracingBatchService = ReturnType<typeof tracingBatchServiceBuilder>;
