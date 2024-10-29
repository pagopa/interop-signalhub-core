import { DB, Logger, SignalResponse } from "pagopa-signalhub-commons";

import { toSignalResponse } from "../model/domain/toSignalResponse.js";
import { signalRepository } from "../repositories/signal.repository.js";

interface ISignalService {
  readonly getSignal: (
    eserviceId: string,
    signalId: number,
    limit: number,
    logger: Logger,
  ) => Promise<{
    lastSignalId: null | number;
    nextSignalId: null | number;
    signals: SignalResponse[];
  }>;
}
export function signalServiceBuilder(db: DB): ISignalService {
  return {
    async getSignal(
      eserviceId: string,
      signalId: number,
      limit: number,
      logger: Logger,
    ): Promise<{
      lastSignalId: null | number;
      nextSignalId: null | number;
      signals: SignalResponse[];
    }> {
      logger.info(
        `SignalService::getSignal, signalId: ${signalId}, limit: ${limit}`,
      );
      const records = await signalRepository(db).getByEservice(
        eserviceId,
        signalId,
        limit,
      );
      const signals: SignalResponse[] = (records || []).map((record) =>
        toSignalResponse(record),
      );
      const lastSignalId = signals.length
        ? signals[signals.length - 1].signalId
        : null;
      const nextSignalId = await signalRepository(db).getNextSignalId(
        eserviceId,
        lastSignalId,
      );
      logger.debug(
        `SignalService::getSignal, signals: ${signals.length}, lastSignalId: ${lastSignalId}, nextSignalId: ${nextSignalId}`,
      );
      return { lastSignalId, nextSignalId, signals };
    },
  };
}

export type SignalService = ReturnType<typeof signalServiceBuilder>;
