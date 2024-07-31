import {
  EServiceEvent,
  encodeOutboundEServiceEvent,
} from "@pagopa/interop-outbound-models";

export function produceEserviceEvent(eserviceEvent: EServiceEvent): string {
  return encodeOutboundEServiceEvent(eserviceEvent);
}
