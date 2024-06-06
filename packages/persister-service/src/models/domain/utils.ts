import { Logger, SQS, SignalMessage } from "signalhub-commons";
import {
  notRecoverableGenericMessageError,
  notRecoverableMessageError,
} from "./errors.js";

export function fromQueueToSignal(
  queueMessage: SQS.Message,
  loggerInstance: Logger
) {
  try {
    const parsedMessage = JSON.parse(queueMessage.Body!);
    let signalEvent = SignalMessage.safeParse(parsedMessage);

    loggerInstance.info(
      `Message from queue: ${JSON.stringify(parsedMessage, null, 2)}`
    );

    if (!signalEvent.success) {
      throw notRecoverableMessageError("parsingError", parsedMessage);
    }
    return signalEvent.data;
  } catch (error) {
    throw notRecoverableGenericMessageError("parsingError");
  }
}
