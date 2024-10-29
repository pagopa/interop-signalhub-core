import { PurposeEvent } from "@pagopa/interop-outbound-models";
import { Logger, logger } from "pagopa-signalhub-commons";

export const buildLoggerInstance = (
  serviceName: string,
  purposeEvent: PurposeEvent,
): Logger =>
  logger({
    eventType: purposeEvent.type,
    eventVersion: purposeEvent.event_version,
    serviceName,
    streamId: purposeEvent.stream_id,
    version: purposeEvent.version,
  });
