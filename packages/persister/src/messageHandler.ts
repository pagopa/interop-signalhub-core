import { SQS, Logger } from "pagopa-signalhub-commons";
import { P, match } from "ts-pattern";
import { StoreSignalService } from "./services/storeSignal.service.js";
import {
  NotRecoverableGenericMessageError,
  NotRecoverableMessageError,
  RecoverableMessageError,
} from "./models/domain/errors.js";
import { parseQueueMessageToSignal } from "./models/domain/utils.js";

export function processMessage(
  storeSignalService: StoreSignalService,
  logger: Logger
): (message: SQS.Message) => Promise<void> {
  return async (message: SQS.Message): Promise<void> => {
    try {
      const signalMessage = parseQueueMessageToSignal(message, logger);

      await storeSignalService.storeSignal(signalMessage);
    } catch (error) {
      return match<unknown>(error)
        .with(
          P.instanceOf(NotRecoverableGenericMessageError),
          async (error) => {
            logger.info(
              `Not recoverable message: even impossibile to save, with error: ${error.code}`
            );
          }
        )

        .with(P.instanceOf(NotRecoverableMessageError), async (error) => {
          logger.info(
            `Not recoverable message saved it on DEAD_SIGNAL with error: ${error.code}`
          );
          await storeSignalService.storeDeadSignal(error.signal);
        })

        .with(P.instanceOf(RecoverableMessageError), async (error) => {
          throw error;
        })

        .otherwise((_error: unknown) => {
          logger.info("Generic error");
          throw error;
        });
    }
  };
}
