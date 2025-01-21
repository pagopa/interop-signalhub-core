import { DelegationEvent } from "@pagopa/interop-outbound-models";
import { Logger, logger } from "pagopa-signalhub-commons";

export const buildLoggerInstance = (
  serviceName: string,
  delegationEvent: DelegationEvent
): Logger =>
  logger({
    serviceName,
    eventType: delegationEvent.type,
    eventVersion: delegationEvent.event_version,
    streamId: delegationEvent.stream_id,
    version: delegationEvent.version
  });
