import { DB, genericInternalError, Logger } from "signalhub-commons";
import { signalRepository } from "../repositories/index.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function signalServiceBuilder(db: DB, logger: Logger) {
  return {
    async cleanup(signalRetentionPeriodInHours: number): Promise<void | null> {
      logger.debug(
        `SignalService::cleanup retention period (hours): ${signalRetentionPeriodInHours}`
      );
      const currentDate = roundDateToTheNearestMinute(getCurrentDate());
      const dateInThePast = subtractTime(
        dateToMilliSecs(currentDate),
        hoursToMilliSecs(signalRetentionPeriodInHours)
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

      if (signalsDeleted === null) {
        throw genericInternalError(
          `Error deleting signals: null response from db`
        );
      }
      logger.debug(`SignalService::cleanup deleted signals: ${signalsDeleted}`);
    },
  };
}

export type SignalService = ReturnType<typeof signalServiceBuilder>;

function getCurrentDate(): Date {
  return new Date();
}

function roundDateToTheNearestMinute(date: Date, minutes = 1): Date {
  const coeff = 1000 * 60 * minutes;
  return new Date(Math.round(date.getTime() / coeff) * coeff);
}

function dateToMilliSecs(date: Date): number {
  return date.getTime();
}

function hoursToMilliSecs(hours: number): number {
  const hour = 1000 * 60 * 60;
  return hours * hour;
}

function subtractTime(dateInMilliSecs: number, milliSecsAgo: number): Date {
  return new Date(dateInMilliSecs - milliSecsAgo);
}
