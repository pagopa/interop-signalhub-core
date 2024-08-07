import { EServiceEvent } from "@pagopa/interop-outbound-models";
import { Logger, logger } from "pagopa-signalhub-commons";

export const buildLoggerInstance = (
  serviceName: string,
  eserviceEvent: EServiceEvent,
  correlationId?: string
): Logger =>
  logger({
    serviceName,
    eventType: eserviceEvent.type,
    eventVersion: eserviceEvent.event_version,
    streamId: eserviceEvent.stream_id,
    correlationId,
  });

export function getSemanticMajorVersion(version: string): number | null {
  if (!version) {
    return null;
  }
  const versionPattern = /^(\d+)\.\d+\.\d+$/;
  const match = version.match(versionPattern);

  if (!match) {
    throw new Error("Format not valid");
  }

  return parseInt(match[1], 10);
}
