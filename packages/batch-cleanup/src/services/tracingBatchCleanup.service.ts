import { DB, Logger, TracingBatchCleanup } from "pagopa-signalhub-commons";
import { tracingBatchCleanupRepository } from "../repositories/tracingBatchCleanup.repository.js";

interface ITracingBatchCleanupService {
  start: (tmstStartAt: string) => Promise<number>;
  end: (tracingBatchCleanup: TracingBatchCleanup) => Promise<void>;
}
export function tracingBatchServiceCleanupBuilder(
  db: DB,
  logger: Logger
): ITracingBatchCleanupService {
  const tracingBatchRepositoryInstance = tracingBatchCleanupRepository(db);
  return {
    async start(tmstStartAt: string): Promise<number> {
      logger.info(`TracingBatchCleanupService::start at: ${tmstStartAt}`);
      return tracingBatchRepositoryInstance.insert(tmstStartAt);
    },

    async end(tracingBatchCleanup: TracingBatchCleanup): Promise<void> {
      logger.info(
        `TracingBatchCleanupService::ending with data: ${JSON.stringify(
          tracingBatchCleanup
        )}`
      );
      await tracingBatchRepositoryInstance.update(tracingBatchCleanup);
    },
  };
}

export type TracingBatchCleanupService = ReturnType<
  typeof tracingBatchServiceCleanupBuilder
>;
