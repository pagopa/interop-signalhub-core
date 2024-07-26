import { AgreementEvent } from "pagopa-interop-outbound-models";
import { Logger, logger } from "pagopa-signalhub-commons";

export const buildLoggerInstance = (
  serviceName: string,
  agreementEvent: AgreementEvent,
  correlationId: string
): Logger =>
  logger({
    serviceName,
    eventType: agreementEvent.type,
    eventVersion: agreementEvent.event_version,
    streamId: agreementEvent.stream_id,
    correlationId,
  });
