import { SQS, SignalMessage } from "pagopa-signalhub-commons";
import {
  notRecoverableGenericMessageError,
  notRecoverableMessageError,
} from "./errors.js";

export function parseQueueMessageToSignal(
  queueMessage: SQS.Message
): SignalMessage {
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

  if (!signalMessage.success) {
    throw notRecoverableMessageError("parsingError", parsedMessage);
  }
  return signalMessage.data;
}
