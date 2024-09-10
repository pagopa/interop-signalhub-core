import {
  ProducerService,
  ProducerEserviceEntity,
  TracingBatch,
  TracingBatchEntity,
  Agreement,
  AgreementEntity,
} from "../db.js";

export const toProducerEservice = (
  producerEserviceEntity: ProducerEserviceEntity
): ProducerService => ({
  eserviceId: producerEserviceEntity.eservice_id,
  producerId: producerEserviceEntity.producer_id,
  agreementId: producerEserviceEntity.agreement_id,
  descriptorId: producerEserviceEntity.descriptor_id,
  state: producerEserviceEntity.state,
  tmstInsert: producerEserviceEntity.tmst_insert,
  tmstLastEdit: producerEserviceEntity.tmst_last_edit,
});

export const toAgreement = (agreementEntity: AgreementEntity): Agreement => ({
  eserviceId: agreementEntity.eservice_id,
  producerId: agreementEntity.producer_id,
  agreementId: agreementEntity.agreement_id,
  consumerId: agreementEntity.consumer_id,
  descriptorId: agreementEntity.descriptor_id,
  state: agreementEntity.state,
  tmstInsert: agreementEntity.tmst_insert,
  tmstLastEdit: agreementEntity.tmst_last_edit,
});

export const toTracingBatch = (
  batchEntity: TracingBatchEntity
): TracingBatch => ({
  batchId: batchEntity.batch_id,
  lastEventId: batchEntity.last_event_id,
  state: batchEntity.state,
  type: batchEntity.type,
  tmstCreated: batchEntity.tmst_created,
});
