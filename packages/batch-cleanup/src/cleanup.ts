import { Logger } from "signalhub-commons";
import { config } from "./config/env.js";
import { SignalService } from "./services/signal.service.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const cleanupBuilder = async (
  signalService: SignalService,
  logger: Logger
) => {
  const cleanSignals = async (): Promise<void> => {
    logger.info(`cleanSignals started at: ${new Date().toISOString()}`);
    try {
      await signalService.cleanup(config.signalsRetentionHours);
    } catch (error) {
      logger.error(`cleanSignals error deleting signals: ${error}`);
    } finally {
      logger.info(`cleanSignals ended at: ${new Date().toISOString()}`);
      process.exit(0);
    }
  };
  return {
    async executeTask(): Promise<void> {
      await cleanSignals();
    },
  };
};
