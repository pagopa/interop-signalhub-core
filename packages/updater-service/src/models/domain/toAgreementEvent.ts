import { Event } from "signalhub-interop-client";
import { AgreementEventDto } from "./model.js";

export function toAgreementEvent(event: Event): AgreementEventDto {
  return {
    eventId: event.eventId,
    eventType: event.eventType,
    agreementId: event.objectId.agreementId,
    objectType: event.objectType,
  };
}
