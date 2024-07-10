import { Event } from "signalhub-interop-client";
import { EserviceEventDto } from "./model.js";

export function toEserviceEvent(event: Event): EserviceEventDto {
  return {
    eventId: event.eventId,
    eventType: event.eventType,
    eServiceId: event.objectId.eServiceId,
    descriptorId: event.objectId.descriptorId,
    objectType: event.objectType,
  };
}
