import { logger, Logger, SQS } from "pagopa-signalhub-commons";
import { P, match } from "ts-pattern";
import { StoreSignalService } from "./services/storeSignal.service.js";
import {
  NotRecoverableGenericMessageError,
  NotRecoverableMessageError,
  RecoverableMessageError,
} from "./models/domain/errors.js";
import { parseQueueMessageToSignal } from "./models/domain/utils.js";

export function processMessage(
  storeSignalService: StoreSignalService
): (message: SQS.Message) => Promise<void> {
  // eslint-disable-next-line functional/no-let
  let loggerInstance: Logger;
  return async (message: SQS.Message): Promise<void> => {
    try {
      const signalMessage = parseQueueMessageToSignal(message);
      const { correlationId, signalId } = signalMessage;
      loggerInstance = logger({
        serviceName: "persister",
        correlationId,
      });
      loggerInstance.info(
        `Processing: signalId: ${signalId}, messageId: ${message.MessageId}`
      );

      await storeSignalService.storeSignal(signalMessage, loggerInstance);
    } catch (error) {
      return match<unknown>(error)
        .with(
          P.instanceOf(NotRecoverableGenericMessageError),
          async (error) => {
            loggerInstance.warn(
              `Not recoverable message: event impossibile to save, with error: ${error.code}`
            );
          }
        )

        .with(P.instanceOf(NotRecoverableMessageError), async (error) => {
          loggerInstance.warn(
            `Not recoverable message saved it on DEAD_SIGNAL with error: ${error.code}`
          );
          await storeSignalService.storeDeadSignal(error.signal);
        })

        .with(P.instanceOf(RecoverableMessageError), async (error) => {
          throw error;
        })

        .otherwise((_error: unknown) => {
          throw error;
        });
    }
  };
}
