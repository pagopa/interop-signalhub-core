import { SnakeCase } from "signalhub-commons";

export enum TracingBatchStateEnum {
  ENDED = "ENDED",
  ENDED_WITH_ERROR = "ENDED_WITH_ERROR",
}

interface EventDto {
  eventId: number;
  objectType: string;
  eventType: string;
}

export interface DeadEvent extends EventDto {
  eventTmpId: string;
  tmstInsert: string;
  errorReason: string;
  eventType: string;
  objectType: string;
  eserviceId: string;
  agreementId: string;
  descriptorId: string;
}

export type DeadEventEntity = SnakeCase<DeadEvent>;

export interface AgreementEventDto extends EventDto {
  agreementId: string;
}

export interface EserviceEventDto extends EventDto {
  eServiceId: string;
  descriptorId: string;
}
