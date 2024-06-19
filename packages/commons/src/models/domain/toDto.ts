import {
  ProducerService,
  ProducerEserviceEntity,
  TracingBatch,
  TracingBatchEntity,
  ConsumerEservice,
  ConsumerEserviceEntity,
} from "../db.js";

export const toProducerEservice = (
  producerEserviceEntity: ProducerEserviceEntity
): ProducerService => ({
  eventId: producerEserviceEntity.event_id,
  eserviceId: producerEserviceEntity.eservice_id,
  producerId: producerEserviceEntity.producer_id,
  agreementId: producerEserviceEntity.agreement_id,
  descriptorId: producerEserviceEntity.descriptor_id,
  state: producerEserviceEntity.state,
  tmstInsert: producerEserviceEntity.tmst_insert,
  tmstLastEdit: producerEserviceEntity.tmst_last_edit,
});

export const toConsumerEservice = (
  consumerEserviceEntity: ConsumerEserviceEntity
): ConsumerEservice => ({
  eventId: consumerEserviceEntity.event_id,
  eserviceId: consumerEserviceEntity.eservice_id,
  producerId: consumerEserviceEntity.producer_id,
  agreementId: consumerEserviceEntity.agreement_id,
  descriptorId: consumerEserviceEntity.descriptor_id,
  state: consumerEserviceEntity.state,
  tmstInsert: consumerEserviceEntity.tmst_insert,
  tmstLastEdit: consumerEserviceEntity.tmst_last_edit,
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
