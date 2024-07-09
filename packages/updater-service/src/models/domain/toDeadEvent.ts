import { AgreementEventDto, DeadEvent, EserviceEventDto } from "./model.js";
import { ApplicationType } from "../../config/env.js";
import { getCurrentDate } from "../../utils.js";

export function toDeadEvent(
  event: AgreementEventDto | EserviceEventDto,
  applicationType: ApplicationType,
  errorReason: string
): DeadEvent {
  if (applicationType === "ESERVICE") {
    const deadEvent = event as EserviceEventDto;

    return {
      eventId: deadEvent.eventId,
      eventType: deadEvent.eventType,
      eserviceId: deadEvent.eServiceId,
      descriptorId: deadEvent.descriptorId,
      objectType: event.objectType,
      tmstInsert: getCurrentDate(),
      errorReason,
    };
  }

  return {
    eventId: event.eventId,
    eventType: event.eventType,
    agreementId: (event as AgreementEventDto).agreementId,
    objectType: event.objectType,
    tmstInsert: getCurrentDate(),
    errorReason,
  };
}
