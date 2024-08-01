import { EServiceDescriptorV1 } from "@pagopa/interop-outbound-models";
import { EserviceDescriptorEntity } from "./model.js";

export function toUpdateDescriptorEntity(
  eserviceId: string,
  descriptorData: EServiceDescriptorV1,
  eventStreamId: string,
  eventVersionId: number
): EserviceDescriptorEntity {
  return {
    eservice_id: eserviceId,
    descriptor_id: descriptorData.id,
    state: descriptorData.state,
    eservice_version: parseInt(descriptorData.version),
    event_stream_id: eventStreamId,
    event_version_id: eventVersionId,
  };
}
