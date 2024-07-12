import { ConsumerEservice } from "pagopa-signalhub-commons";
import { Agreement } from "pagopa-signalhub-interop-client";

export function toConsumerEservice(
  agreeement: Agreement,
  eventId: number
): ConsumerEservice {
  return {
    eventId,
    eserviceId: agreeement.eserviceId,
    producerId: agreeement.producerId,
    agreementId: agreeement.id,
    descriptorId: agreeement.descriptorId,
    state: agreeement.state,
  };
}
