import { ProducerEserviceEntity } from "./model.js";

export function toProducerEserviceEntity(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eServiceDb: any // db response
): ProducerEserviceEntity {
  return {
    eventId: eServiceDb.event_id,
    eserviceId: eServiceDb.eservice_id,
    producerId: eServiceDb.producer_id,
    agreementId: eServiceDb.agreement_id,
    descriptorId: eServiceDb.descriptor_id,
    state: eServiceDb.state,
    tmstInsert: eServiceDb.tmst_insert,
    tmstLastEdit: eServiceDb.tmst_last_edit,
  };
}
