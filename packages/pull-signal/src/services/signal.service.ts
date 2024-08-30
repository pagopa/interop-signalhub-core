import { DB, Logger, SignalResponse } from "pagopa-signalhub-commons";
import { signalRepository } from "../repositories/signal.repository.js";
import { toSignalResponse } from "../model/domain/toSignalResponse.js";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function signalServiceBuilder(db: DB) {
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
      const records = await signalRepository(db).getByEservice(
        eserviceId,
        signalId,
        limit
      );
      const signals: SignalResponse[] = (records || []).map((record) =>
        toSignalResponse(record)
      );
      const lastSignalId = signals.length
        ? signals[signals.length - 1].signalId
        : null;
      const nextSignalId = await signalRepository(db).getNextSignalId(
        eserviceId,
        lastSignalId
      );
      return { signals, lastSignalId, nextSignalId };
    },
  };
}

export type SignalService = ReturnType<typeof signalServiceBuilder>;
