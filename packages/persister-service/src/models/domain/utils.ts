import { Logger, SQS, SignalMessage } from "signalhub-commons";
import {
  notRecoverableGenericMessageError,
  notRecoverableMessageError,
} from "./errors.js";

export function parseQueueMessageToSignal(
  queueMessage: SQS.Message,
  loggerInstance: Logger
): SignalMessage {
  // eslint-disable-next-line functional/no-let
  let parsedMessage;
  try {
    if (!queueMessage.Body) {
      throw notRecoverableGenericMessageError("parsingError", queueMessage);
    }
    parsedMessage = JSON.parse(queueMessage.Body);
  } catch (error) {
    throw notRecoverableGenericMessageError(
      "notValidJsonError",
      queueMessage.Body
    );
  }
  const signalMessage = SignalMessage.safeParse(parsedMessage);
  loggerInstance.info(
    `Message from queue: ${JSON.stringify(parsedMessage, null, 2)}`
  );

  if (!signalMessage.success) {
    throw notRecoverableMessageError("parsingError", parsedMessage);
  }
  return signalMessage.data;
}
