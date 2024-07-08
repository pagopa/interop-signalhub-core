import { AgreementEventDto, DeadEvent, EserviceEventDto } from "./model.js";
import { ApplicationType } from "../../config/env.js";
import { getCurrentDate } from "../../utils.js";

export function toDeadEvent(
  event: AgreementEventDto | EserviceEventDto,
  applicationType: ApplicationType
): DeadEvent {
  if (applicationType === "ESERVICE") {
    const deadEvent = event as EserviceEventDto;

    return {
      eventId: deadEvent.eventId,
      eventType: deadEvent.eventType,
      errorReason:
        "The number of attempts to retrieve the event has been exceeded",
      eserviceId: deadEvent.eServiceId,
      descriptorId: deadEvent.descriptorId,
      objectType: event.objectType,
      tmstInsert: getCurrentDate(),
    };
  }

  return {
    eventId: event.eventId,
    eventType: event.eventType,
    errorReason:
      "The number of attempts to retrieve the event has been exceeded",
    agreementId: (event as AgreementEventDto).agreementId,
    objectType: event.objectType,
    tmstInsert: getCurrentDate(),
  };
}
