import { Agreement as BatchAgreement } from "pagopa-signalhub-commons";
import { Agreement } from "pagopa-signalhub-interop-client";

export function toAgreement(
  agreeement: Agreement,
  eventId: number
): BatchAgreement {
  return {
    eventId,
    eserviceId: agreeement.eserviceId,
    producerId: agreeement.producerId,
    agreementId: agreeement.id,
    descriptorId: agreeement.descriptorId,
    state: agreeement.state,
    consumerId: agreeement.consumerId,
  };
}
