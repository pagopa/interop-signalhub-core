import { SQS, SignalMessage, logger } from "signalhub-commons";
import { storeSignalServiceBuilder } from "./services/storeSignal.service.js";
import {
  NotRecoverableMessageError,
  RecoverableMessageError,
  notRecoverableMessageError,
} from "./models/domain/errors.js";
import { P, match } from "ts-pattern";
import { DeadSignal } from "./models/domain/model.js";

const storeSignalService = storeSignalServiceBuilder();
const loggerInstance = logger({});

export function processMessage(): (message: SQS.Message) => Promise<void> {
  return async (message: SQS.Message): Promise<void> => {
    try {
      const parsedMessage = JSON.parse(message.Body!);
      let signalEvent = SignalMessage.safeParse(parsedMessage);

      loggerInstance.info(
        `Message from queue: ${JSON.stringify(parsedMessage, null, 2)}`
      );

      if (!signalEvent.success) {
        throw notRecoverableMessageError(
          "parsingError",
          parsedMessage as DeadSignal
        );
      } else {
        await storeSignalService.storeSignal(signalEvent.data);
      }
    } catch (error) {
      return match<unknown>(error)
        .with(P.instanceOf(NotRecoverableMessageError), async (error) => {
          loggerInstance.info(
            `Not recoverable message saved it on DEAD_SIGNAL with error: ${error.code}`
          );
          await storeSignalService.storeDeadSignal(error.signal, error.code);
        })

        .with(P.instanceOf(RecoverableMessageError), async (error) => {
          loggerInstance.info(
            `Generated error with code: ${error.code} message will remain on queue`
          );
          throw error;
        })

        .otherwise((_error: unknown) => {
          loggerInstance.info("Generic error");
          throw error;
        });
    }
  };
}
