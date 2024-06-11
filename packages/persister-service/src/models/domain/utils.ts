import { Logger, SQS, SignalMessage } from "signalhub-commons";
import {
  notRecoverableGenericMessageError,
  notRecoverableMessageError,
} from "./errors.js";

export function parseQueueMessageToSignal(
  queueMessage: SQS.Message,
  loggerInstance: Logger
) {
  let parsedMessage;
  try {
    parsedMessage = JSON.parse(queueMessage.Body!);
  } catch (error) {
    throw notRecoverableGenericMessageError(
      "notValidJsonError",
      queueMessage.Body
    );
  }
  let signalMessage = SignalMessage.safeParse(parsedMessage);
  loggerInstance.info(
    `Message from queue: ${JSON.stringify(parsedMessage, null, 2)}`
  );

  if (!signalMessage.success) {
    throw notRecoverableMessageError("parsingError", parsedMessage);
  }
  return signalMessage.data;
}
