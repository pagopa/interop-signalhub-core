import { EServiceEvent } from "@pagopa/interop-outbound-models";
import { Logger, logger } from "pagopa-signalhub-commons";

export const buildLoggerInstance = (
  serviceName: string,
  eserviceEvent: EServiceEvent,
): Logger =>
  logger({
    eventType: eserviceEvent.type,
    eventVersion: eserviceEvent.event_version,
    serviceName,
    streamId: eserviceEvent.stream_id,
    version: eserviceEvent.version,
  });

export function getSemanticMajorVersion(version: string): null | number {
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
