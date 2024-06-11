import { Logger, SignalMessageSchema, SignalPayload } from "signalhub-commons";
import { SignalMessage } from "signalhub-commons";
import fastJson from "fast-json-stringify";

export function domainServiceBuilder() {
  return {
    signalToMessage(
      signalPayload: SignalPayload,
      correlationId: string,
      logger: Logger
    ): string {
      logger.debug(
        `DomainService::signalToMessage signalId: ${signalPayload.signalId}, correlationId: ${correlationId}`
      );
      return toJson(
        SignalMessageSchema,
        toSignalMessage(signalPayload, correlationId)
      );
    },
  };
}

export type DomainService = ReturnType<typeof domainServiceBuilder>;

const toSignalMessage = (
  signalRequest: SignalPayload,
  correlationId: string
): SignalMessage => {
  return {
    ...signalRequest,
    correlationId,
  };
};
const toJson = (
  signalPayload: object,
  signalMessage: SignalMessage
): string => {
  return fastJson(signalPayload)(signalMessage);
};
