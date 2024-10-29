import {
  Agreement,
  AgreementEntity,
  ProducerEserviceEntity,
  ProducerService,
  TracingBatch,
  TracingBatchEntity,
} from "../db.js";

export const toProducerEservice = (
  producerEserviceEntity: ProducerEserviceEntity,
): ProducerService => ({
  agreementId: producerEserviceEntity.agreement_id,
  descriptorId: producerEserviceEntity.descriptor_id,
  eserviceId: producerEserviceEntity.eservice_id,
  producerId: producerEserviceEntity.producer_id,
  state: producerEserviceEntity.state,
  tmstInsert: producerEserviceEntity.tmst_insert,
  tmstLastEdit: producerEserviceEntity.tmst_last_edit,
});

export const toAgreement = (agreementEntity: AgreementEntity): Agreement => ({
  agreementId: agreementEntity.agreement_id,
  consumerId: agreementEntity.consumer_id,
  descriptorId: agreementEntity.descriptor_id,
  eserviceId: agreementEntity.eservice_id,
  producerId: agreementEntity.producer_id,
  state: agreementEntity.state,
  tmstInsert: agreementEntity.tmst_insert,
  tmstLastEdit: agreementEntity.tmst_last_edit,
});

export const toTracingBatch = (
  batchEntity: TracingBatchEntity,
): TracingBatch => ({
  batchId: batchEntity.batch_id,
  lastEventId: batchEntity.last_event_id,
  state: batchEntity.state,
  tmstCreated: batchEntity.tmst_created,
  type: batchEntity.type,
});
