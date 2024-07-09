import { DB, genericInternalError, Logger } from "signalhub-commons";
import { signalRepository } from "../repositories/index.js";
import { ClockService } from "./clock.service.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function signalServiceBuilder(
  db: DB,
  clockService: ClockService,
  logger: Logger
) {
  return {
    async cleanup(
      signalRetentionPeriodInHours: number
    ): Promise<number | null> {
      logger.info(
        `SignalService::cleanup retention period (hours): ${signalRetentionPeriodInHours}`
      );
      const currentDate = clockService.getCurrentDate();
      const dateInThePast = clockService.getPastDate(
        currentDate,
        signalRetentionPeriodInHours
      );
      logger.info(
        `SignalService::cleanup current date ISO [${currentDate.toISOString()}], UTC: [${currentDate.toUTCString()}], LOCAL: [${currentDate.toLocaleString()}]`
      );
      logger.info(
        `SignalService::cleanup date limit:  ISO [${dateInThePast.toISOString()}], UTC: [${dateInThePast.toUTCString()}], LOCAL: [${dateInThePast.toLocaleString()}]`
      );
      const signalsDeleted = await signalRepository(db).deleteBy(dateInThePast);
      logger.info(`SignalService::cleanup deleted signals: ${signalsDeleted}`);
      if (signalsDeleted === null) {
        throw genericInternalError(
          `Error deleting signals: null response from db`
        );
      }
      return signalsDeleted;
    },
  };
}

export type SignalService = ReturnType<typeof signalServiceBuilder>;
