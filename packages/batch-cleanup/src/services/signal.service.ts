import { DB, Logger, genericInternalError } from "pagopa-signalhub-commons";

import { signalRepository } from "../repositories/index.js";
import { ClockService } from "./clock.service.js";

interface ISignalService {
  readonly cleanup: (
    signalRetentionPeriodInHours: number,
  ) => Promise<{ countDeleted: number; dateInThePast: Date }>;
}
export function signalServiceBuilder(
  db: DB,
  clockService: ClockService,
  logger: Logger,
): ISignalService {
  return {
    async cleanup(
      signalRetentionPeriodInHours: number,
    ): Promise<{ countDeleted: number; dateInThePast: Date }> {
      logger.info(
        `SignalService::cleanup retention period (hours): ${signalRetentionPeriodInHours}`,
      );
      const currentDate = clockService.getCurrentDate();
      const dateInThePast = clockService.getPastDate(
        currentDate,
        signalRetentionPeriodInHours,
      );
      logger.info(
        `SignalService::cleanup current date ISO [${currentDate.toISOString()}], UTC: [${currentDate.toUTCString()}], LOCAL: [${currentDate.toLocaleString()}]`,
      );
      logger.info(
        `SignalService::cleanup date limit:  ISO [${dateInThePast.toISOString()}], UTC: [${dateInThePast.toUTCString()}], LOCAL: [${dateInThePast.toLocaleString()}]`,
      );
      const countDeleted = await signalRepository(db).deleteBy(dateInThePast);
      logger.info(`SignalService::cleanup deleted signals: ${countDeleted}`);
      if (countDeleted === null) {
        throw genericInternalError(
          `Error deleting signals: null response from db`,
        );
      }
      return { countDeleted, dateInThePast };
    },
  };
}

export type SignalService = ReturnType<typeof signalServiceBuilder>;
