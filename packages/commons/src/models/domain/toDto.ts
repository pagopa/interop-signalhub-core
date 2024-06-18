import {
  ProducerEserviceDto,
  ProducerEserviceEntity,
  TracingBatchDto,
  TracingBatchEntity,
} from "../db.js";

export const toProducerEserviceDto = (
  producerEserviceEntity: ProducerEserviceEntity
): ProducerEserviceDto => ({
  eventId: producerEserviceEntity.event_id,
  eserviceId: producerEserviceEntity.eservice_id,
  producerId: producerEserviceEntity.producer_id,
  agreementId: producerEserviceEntity.agreement_id,
  descriptorId: producerEserviceEntity.descriptor_id,
  state: producerEserviceEntity.state,
  tmstInsert: producerEserviceEntity.tmst_insert,
  tmstLastEdit: producerEserviceEntity.tmst_last_edit,
});

export const toConsumerEserviceDto = (
  consumerEserviceEntity: ProducerEserviceEntity
): ProducerEserviceDto => ({
  eventId: consumerEserviceEntity.event_id,
  eserviceId: consumerEserviceEntity.eservice_id,
  producerId: consumerEserviceEntity.producer_id,
  agreementId: consumerEserviceEntity.agreement_id,
  descriptorId: consumerEserviceEntity.descriptor_id,
  state: consumerEserviceEntity.state,
  tmstInsert: consumerEserviceEntity.tmst_insert,
  tmstLastEdit: consumerEserviceEntity.tmst_last_edit,
});

export const toTracingBatchDto = (
  batchEntity: TracingBatchEntity
): TracingBatchDto => ({
  batchId: batchEntity.batch_id,
  lastEventId: batchEntity.last_event_id,
  state: batchEntity.state,
  type: batchEntity.type,
  tmstCreated: batchEntity.tmst_created,
});
