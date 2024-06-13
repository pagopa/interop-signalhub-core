import { Logger, SignalMessageSchema, SignalPayload } from "signalhub-commons";
import { SignalMessage } from "signalhub-commons";
import fastJson from "fast-json-stringify";

export function domainServiceBuilder(): {
  // eslint-disable-next-line functional/no-method-signature
  signalToMessage(
    signalRequest: SignalPayload,
    correlationId: string,
    logger: Logger
  ): string;
} {
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
  signalPayload: SignalPayload,
  correlationId: string
): SignalMessage => ({
  ...signalPayload,
  correlationId,
});
const toJson = (signalPayload: object, signalMessage: SignalMessage): string =>
  fastJson(signalPayload)(signalMessage);
