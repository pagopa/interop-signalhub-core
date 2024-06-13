import { Agreement } from "signalhub-interop-client";
import { ConsumerEserviceEntity } from "./model.js";

export function toConsumerEservice(
  agreeement: Agreement,
  eventId: number
): ConsumerEserviceEntity {
  return {
    eventId,
    eserviceId: agreeement.eserviceId,
    producerId: agreeement.producerId,
    agreementId: agreeement.id,
    descriptorId: agreeement.descriptorId,
    state: agreeement.state,
  };
}
