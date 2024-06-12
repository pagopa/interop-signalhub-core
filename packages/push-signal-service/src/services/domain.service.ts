import { Logger, SignalMessageSchema, SignalRequest } from "signalhub-commons";
import { SignalMessage } from "signalhub-commons";
import fastJson from "fast-json-stringify";

export function domainServiceBuilder(): {
  // eslint-disable-next-line functional/no-method-signature
  signalToMessage(
    signalRequest: SignalRequest,
    correlationId: string,
    logger: Logger
  ): string;
} {
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
): SignalMessage => ({
  ...signalRequest,
  correlationId,
});
const toJson = (signalSchema: object, signalMessage: SignalMessage): string =>
  fastJson(signalSchema)(signalMessage);
