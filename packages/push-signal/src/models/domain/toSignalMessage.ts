import fastJson from "fast-json-stringify";
import {
  SignalMessage,
  SignalMessageSchema,
  SignalPayload,
} from "pagopa-signalhub-commons";

export function toSignalMessage(
  signalRequest: SignalPayload,
  correlationId: string,
): string {
  return toJson(SignalMessageSchema, tolMessage(signalRequest, correlationId));
}
const tolMessage = (
  signalPayload: SignalPayload,
  correlationId: string,
): SignalMessage => ({
  ...signalPayload,
  correlationId,
});
const toJson = (signalPayload: object, signalMessage: SignalMessage): string =>
  fastJson(signalPayload)(signalMessage);
