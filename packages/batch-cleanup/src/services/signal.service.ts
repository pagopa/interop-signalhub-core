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
      logger.debug(
        `SignalService::cleanup retention period (hours): ${signalRetentionPeriodInHours}`
      );
      const currentDate = clockService.roundDateToTheNearestMinute(
        clockService.getCurrentDate()
      );
      const dateInThePast = clockService.subtractTime(
        clockService.dateToMilliSecs(currentDate),
        clockService.hoursToMilliSecs(signalRetentionPeriodInHours)
      );
      logger.debug(
        `SignalService::cleanup current date ISO [${currentDate.toISOString()}], UTC: [${currentDate.toUTCString()}], LOCAL: [${currentDate.toLocaleString()}]`
      );
      logger.debug(
        `SignalService::cleanup date limit:  ISO [${dateInThePast.toISOString()}], UTC: [${dateInThePast.toUTCString()}], LOCAL: [${dateInThePast.toLocaleString()}]`
      );
      // check PRE DELETE
      // clock application == clock database
      // signals to be deleted are the last signals?
      const signalsDeleted = await signalRepository(db).deleteBy(dateInThePast);
      logger.debug(`SignalService::cleanup deleted signals: ${signalsDeleted}`);
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
