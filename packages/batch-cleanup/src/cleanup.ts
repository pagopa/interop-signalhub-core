import { Logger, TracingBatchCleanup } from "pagopa-signalhub-commons";
import { config } from "./config/env.js";
import { SignalService } from "./services/signal.service.js";
import { TracingBatchCleanupService } from "./services/tracingBatchCleanup.service.js";

interface ICleanupBuilder {
  readonly executeTask: () => Promise<void>;
}

export const cleanupBuilder = async (
  signalService: SignalService,
  tracingBatchCleanupService: TracingBatchCleanupService,
  logger: Logger
): Promise<ICleanupBuilder> => {
  const cleanSignals = async (): Promise<void> => {
    let tracingBatchCleanup: TracingBatchCleanup = {
      batchId: null,
      tmstStartAt: null,
      tmstEndAt: null,
      tmstDeleteFrom: null,
      error: null,
      countDeleted: null,
    };
    const tmstStartAt = new Date().toISOString();

    try {
      const batchId = await tracingBatchCleanupService.start(tmstStartAt);
      tracingBatchCleanup = {
        batchId,
        tmstStartAt,
      };

      const { countDeleted, dateInThePast } = await signalService.cleanup(
        config.signalsRetentionHours
      );

      tracingBatchCleanup = {
        ...tracingBatchCleanup,
        tmstEndAt: new Date().toISOString(),
        tmstDeleteFrom: dateInThePast.toISOString(),
        countDeleted,
      };
      await tracingBatchCleanupService.end(tracingBatchCleanup);
    } catch (error) {
      logger.error(`cleanSignals error deleting signals: ${error}`);
      if (tracingBatchCleanup.batchId) {
        tracingBatchCleanup = {
          error,
          ...tracingBatchCleanup,
        };
        await tracingBatchCleanupService.end(tracingBatchCleanup);
      }
    } finally {
      process.exit(0);
    }
  };
  return {
    async executeTask(): Promise<void> {
      await cleanSignals();
    },
  };
};
