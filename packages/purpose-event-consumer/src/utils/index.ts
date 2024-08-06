import {
  PurposeEvent,
  PurposeV1,
  PurposeV2,
} from "@pagopa/interop-outbound-models";
import { Logger, logger } from "pagopa-signalhub-commons";

export const buildLoggerInstance = (
  serviceName: string,
  purposeEvent: PurposeEvent,
  correlationId: string
): Logger =>
  logger({
    serviceName,
    eventType: purposeEvent.type,
    eventVersion: purposeEvent.event_version,
    streamId: purposeEvent.stream_id,
    correlationId,
  });

export const isPurposeWithoutVersions = (
  purpose: PurposeV1 | PurposeV2
): boolean => Array.isArray(purpose.versions) && purpose.versions.length === 0;
