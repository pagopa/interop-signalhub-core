/* eslint-disable max-classes-per-file */

export const QueueEventsErrorCodes = {
  genericError: "0001",
  notEventsAvailable: "0002",
};

export type QueueEventsErrorCodes = keyof typeof QueueEventsErrorCodes;

export class QueueEventsError<QueueEventsErrorCode> extends Error {
  public code: QueueEventsErrorCode;
  public title: string;
  public detail: string;

  constructor({
    code,
    title,
    detail,
  }: {
    code: QueueEventsErrorCode;
    title: string;
    detail: string;
    correlationId?: string;
  }) {
    super(detail);
    this.code = code;
    this.title = title;
    this.detail = detail;
  }
}

export class EmptyQueueEventsError extends QueueEventsError<"notEventsAvailable"> {
  constructor({
    title,
    detail,
  }: {
    code: QueueEventsErrorCodes;
    title: string;
    detail: string;
  }) {
    super({
      code: "notEventsAvailable",
      title,
      detail,
    });
  }
}

export class QueueEventsGenericError extends QueueEventsError<"genericError"> {
  constructor({
    title,
    detail,
  }: {
    code: QueueEventsErrorCodes;
    title: string;
    detail: string;
  }) {
    super({
      code: "genericError",
      title,
      detail,
    });
  }
}

export function emptyQueueEventsException(): EmptyQueueEventsError {
  return new EmptyQueueEventsError({
    code: "notEventsAvailable",
    title: "Not events available on queue",
    detail: "Not events available",
  });
}

export function queueEventsGenericException(
  code: QueueEventsErrorCodes,
  detail: string
): QueueEventsGenericError {
  return new QueueEventsGenericError({
    code,
    title: "Generic Exception on retrieving list from events queue",
    detail,
  });
}
