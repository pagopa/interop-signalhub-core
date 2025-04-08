import {
  DB,
  Logger,
  SignalRecord,
  SignalResponse
} from "pagopa-signalhub-commons";

import { config } from "../config/env.js";
import { toSignalResponse } from "../model/domain/toSignalResponse.js";
import { signalRepository } from "../repositories/signal.repository.js";

interface ISignalService {
  readonly getSignal: (
    eserviceId: string,
    signalId: number,
    limit: number,
    logger: Logger
  ) => Promise<{
    signals: SignalResponse[];
    lastSignalId: number | null;
    nextSignalId: number | null;
  }>;
}
export function signalServiceBuilder(db: DB): ISignalService {
  return {
    async getSignal(
      eserviceId: string,
      signalId: number,
      limit: number,
      logger: Logger
    ): Promise<{
      signals: SignalResponse[];
      lastSignalId: number | null;
      nextSignalId: number | null;
    }> {
      logger.info(
        `SignalService::getSignal, signalId: ${signalId}, limit: ${limit}`
      );

      // eslint-disable-next-line functional/no-let
      let records: SignalRecord[] | null = [];

      if (config.featureFlagTimeWindow) {
        logger.debug(
          `SignalService::getSignal with config FEATURE_FLAG_TIME_WINDOW = true, timeWindowInSeconds: ${config.timeWindowInSeconds} seconds`
        );
        records = await signalRepository(db).getByEserviceByTimeWindow(
          eserviceId,
          signalId,
          limit,
          config.timeWindowInSeconds
        );
      } else {
        records = await signalRepository(db).getByEservice(
          eserviceId,
          signalId,
          limit
        );
      }

      const signals: SignalResponse[] = (records || []).map(toSignalResponse);
      const lastSignalId = signals.length
        ? signals[signals.length - 1].signalId
        : null;
      const nextSignalId = await signalRepository(db).getNextSignalId(
        eserviceId,
        lastSignalId
      );
      logger.debug(
        `SignalService::getSignal, signals: ${signals.length}, lastSignalId: ${lastSignalId}, nextSignalId: ${nextSignalId}`
      );
      return { signals, lastSignalId, nextSignalId };
    }
  };
}

export type SignalService = ReturnType<typeof signalServiceBuilder>;
