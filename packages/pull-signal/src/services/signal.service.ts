import { DB, Logger, SignalResponse } from "pagopa-signalhub-commons";

import { config } from "../config/env.js";
import { toSignalResponse } from "../model/domain/toSignalResponse.js";
import { signalRepository } from "../repositories/signal.repository.js";

export type SignalService = ReturnType<typeof signalServiceBuilder>;
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
  const repository = signalRepository(db);

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

      if (config.featureFlagTimeWindow) {
        logger.debug(
          `SignalService::getSignal with config FEATURE_FLAG_TIME_WINDOW = true, timeWindowInSeconds: ${config.timeWindowInSeconds} seconds`
        );
      }

      const records = config.featureFlagTimeWindow
        ? await repository.getByEserviceByTimeWindow(
            eserviceId,
            signalId,
            limit,
            config.timeWindowInSeconds
          )
        : await repository.getByEservice(eserviceId, signalId, limit);
      const signals = records.map(toSignalResponse);
      const lastSignalId = signals.at(-1)?.signalId ?? null;
      const nextSignalId = await repository.getNextSignalId(
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
