import { Logger, SignalMessageSchema, SignalRequest } from "signalhub-commons";
import { SignalMessage } from "signalhub-commons";
import fastJson from "fast-json-stringify";

export function domainServiceBuilder() {
  return {
    signalToMessage(
      signalRequest: SignalRequest,
      correlationId: string,
      logger: Logger
    ): string {
      logger.debug(
        `DomainService::signalToMessage signalId: ${signalRequest.signalId}, correlationId: ${correlationId}`
      );
      return toJson(
        SignalMessageSchema,
        toSignalMessage(signalRequest, correlationId)
      );
    },
  };
}

export type DomainService = ReturnType<typeof domainServiceBuilder>;

const toSignalMessage = (
  signalRequest: SignalRequest,
  correlationId: string
): SignalMessage => {
  return {
    ...signalRequest,
    correlationId,
  };
};
const toJson = (signalSchema: object, signalMessage: SignalMessage): string => {
  return fastJson(signalSchema)(signalMessage);
};
