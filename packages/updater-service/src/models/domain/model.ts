export enum TracingBatchStateEnum {
  ENDED = "ENDED",
  ENDED_WITH_ERROR = "ENDED_WITH_ERROR",
}

interface EventDto {
  eventId: number;
  objectType: string;
  eventType: string;
}

export interface AgreementEventDto extends EventDto {
  agreementId: string;
}

export interface EserviceEventDto extends EventDto {
  eServiceId: string;
  descriptorId: string;
}
