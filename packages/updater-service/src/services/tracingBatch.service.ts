import { DB, genericInternalError } from "signalhub-commons";
import { tracingBatchRepository } from "../repositories/tracingBatch.repository.js";
import { TracingBatchStateEnum } from "../models/domain/model.js";
import { ApplicationType, config } from "../config/env.js";

interface ITracingBatchService {
  getLastEventIdByTracingBatchAndType: (
    applicationType: ApplicationType
  ) => Promise<number>;
  terminateTracingBatch: (
    tracingBatchState: TracingBatchStateEnum,
    lastEventId: number,
    applicationType: ApplicationType
  ) => Promise<number>;

  countBatchInErrorWithLastEventIdAndType: (
    eventId: number,
    applicationType: ApplicationType
  ) => Promise<number>;
}
export function tracingBatchServiceBuilder(db: DB): ITracingBatchService {
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

        // If DB get empty list retrieving events starting from 0
        if (!tracingBatchEntityList || tracingBatchEntityList.length <= 0) {
          return 0;
        }

        if (tracingBatchEntityList[0].state === TracingBatchStateEnum.ENDED) {
          return parseInt(tracingBatchEntityList[0].lastEventId, 10);
        }

        // If For a specific event we try a certain number of times, updater will skip it and will start
        // from next event
        if (tracingBatchEntityList.length > config.attemptEvent) {
          return (
            parseInt(
              tracingBatchEntityList[tracingBatchEntityList.length - 1]
                .lastEventId,
              10
            ) + 1
          );
        }

        return parseInt(tracingBatchEntityList[0].lastEventId, 10);
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

    async countBatchInErrorWithLastEventIdAndType(
      eventId: number,
      applicationType: ApplicationType
    ): Promise<number> {
      const tracingBatchEntityList =
        await tracingBatchRepositoryInstance.findAllByStateEndedWithErrorAndLastEventIdAndType(
          eventId,
          applicationType
        );

      return tracingBatchEntityList.length;
    },
  };
}

export type TracingBatchService = ReturnType<typeof tracingBatchServiceBuilder>;
