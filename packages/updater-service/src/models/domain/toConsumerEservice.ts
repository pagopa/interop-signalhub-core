import { ConsumerEserviceDto } from "signalhub-commons";
import { Agreement } from "signalhub-interop-client";

export function toConsumerEservice(
  agreeement: Agreement,
  eventId: number
): ConsumerEserviceDto {
  return {
    eventId,
    eserviceId: agreeement.eserviceId,
    producerId: agreeement.producerId,
    agreementId: agreeement.id,
    descriptorId: agreeement.descriptorId,
    state: agreeement.state,
  };
}
