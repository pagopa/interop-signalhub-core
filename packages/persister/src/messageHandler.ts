import { Logger, logger, SQS } from "pagopa-signalhub-commons";
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
  let loggerinstance: Logger;
  return async (message: SQS.Message): Promise<void> => {
    try {
      const signalMessage = parseQueueMessageToSignal(message);
      const { correlationId, signalId } = signalMessage;
      loggerinstance = logger({
        serviceName: "persister",
        correlationId,
      });

      loggerinstance.info(`Processing message with signalId: ${signalId}`);

      await storeSignalService.storeSignal(signalMessage, loggerinstance);
    } catch (error) {
      return match<unknown>(error)
        .with(
          P.instanceOf(NotRecoverableGenericMessageError),
          async (error) => {
            loggerinstance.warn(
              `Not recoverable message: event impossibile to save, with error: ${error.code}`
            );
          }
        )

        .with(P.instanceOf(NotRecoverableMessageError), async (error) => {
          loggerinstance.warn(
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
