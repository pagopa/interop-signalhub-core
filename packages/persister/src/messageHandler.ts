import { Logger, SQS } from "pagopa-signalhub-commons";
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
      const signalMessage = parseQueueMessageToSignal(message);
      const { correlationId, signalId } = signalMessage;
      logger.info(
        `processing message CID: ${correlationId}, signalId: ${signalId}`
      );

      await storeSignalService.storeSignal(signalMessage, logger);
    } catch (error) {
      return match<unknown>(error)
        .with(
          P.instanceOf(NotRecoverableGenericMessageError),
          async (error) => {
            logger.warn(
              `Not recoverable message: event impossibile to save, with error: ${error.code}`
            );
          }
        )

        .with(P.instanceOf(NotRecoverableMessageError), async (error) => {
          logger.warn(
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
