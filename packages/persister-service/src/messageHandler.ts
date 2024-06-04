import { SQS, logger } from "signalhub-commons";
import { storeSignalServiceBuilder } from "./services/storeSignal.service.js";
import {
  NotRecoverableMessageError,
  RecoverableMessageError,
} from "./models/domain/errors.js";
import { P, match } from "ts-pattern";
import { fromQueueToSignal as parseQueueMessageToSignal } from "./models/domain/utils.js";

const storeSignalService = storeSignalServiceBuilder();
const loggerInstance = logger({});

export function processMessage(): (message: SQS.Message) => Promise<void> {
  return async (message: SQS.Message): Promise<void> => {
    try {
      const signalEvent = parseQueueMessageToSignal(message, loggerInstance);

      await storeSignalService.storeSignal(signalEvent);
    } catch (error) {
      return match<unknown>(error)
        .with(P.instanceOf(NotRecoverableMessageError), async (error) => {
          loggerInstance.info(
            `Not recoverable message saved it on DEAD_SIGNAL with error: ${error.code}`
          );
          await storeSignalService.storeDeadSignal(error.signal);
        })

        .with(P.instanceOf(RecoverableMessageError), async (error) => {
          throw error;
        })

        .otherwise((_error: unknown) => {
          loggerInstance.info("Generic error");
          throw error;
        });
    }
  };
}