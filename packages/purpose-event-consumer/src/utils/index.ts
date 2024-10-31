import { PurposeEvent } from "@pagopa/interop-outbound-models";
import { Logger, logger } from "pagopa-signalhub-commons";

export const buildLoggerInstance = (
  serviceName: string,
  purposeEvent: PurposeEvent
): Logger =>
  logger({
    serviceName,
    eventType: purposeEvent.type,
    eventVersion: purposeEvent.event_version,
    streamId: purposeEvent.stream_id,
    version: purposeEvent.version
  });
