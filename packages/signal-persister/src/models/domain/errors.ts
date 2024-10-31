import { Signal } from "pagopa-signalhub-commons";

import { DeadSignal } from "./model.js";

export class PersisterServiceError<T> extends Error {
  public code: T;
  public detail: string;
  public title: string;

  constructor({
    code,
    title,
    detail
  }: {
    code: T;
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

export class NotRecoverableGenericMessageError extends PersisterServiceError<NotRecoverableMessageErrorCodes> {
  public signal: unknown; // can be anything: case of object different from Signal
  constructor({
    code,
    title,
    detail,
    signal
  }: {
    code: NotRecoverableMessageErrorCodes;
    title: string;
    detail: string;
    signal: unknown;
  }) {
    super({ code, title, detail });
    this.signal = signal;
  }
}

export class NotRecoverableMessageError extends PersisterServiceError<NotRecoverableMessageErrorCodes> {
  public signal: DeadSignal;
  constructor({
    code,
    title,
    detail,
    signal
  }: {
    code: NotRecoverableMessageErrorCodes;
    title: string;
    detail: string;
    signal: DeadSignal;
  }) {
    super({ code, title, detail });
    this.signal = signal;
  }
}

export class RecoverableMessageError extends PersisterServiceError<RecoverableMessageErrorCodes> {}

export const recoverableMessageErrorCode = {
  dbConnection: "0001"
};
export const notRecoverableMessageErrorCodes = {
  duplicateSignal: "0002",
  parsingError: "0010",
  genericError: "0011",
  notValidJsonError: "0012"
};

export function getErrorReason(type: ErrorCodes): string {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return errorDetails.get(type)!;
}

export type NotRecoverableMessageErrorCodes =
  keyof typeof notRecoverableMessageErrorCodes;

export type RecoverableMessageErrorCodes =
  keyof typeof recoverableMessageErrorCode;

export type ErrorCodes =
  | NotRecoverableMessageErrorCodes
  | RecoverableMessageErrorCodes;

const errorDetails = new Map<ErrorCodes, string>([
  ["dbConnection", "Database connection error"],
  ["duplicateSignal", "The signal is already saved on database"],
  ["genericError", "Generic error"],
  ["notValidJsonError", "The message is not a signal, not valid JSON"],
  ["parsingError", "The signal could not be parsed"]
]);

export function recoverableMessageError(
  errorCode: RecoverableMessageErrorCodes,
  correlationId = ""
): RecoverableMessageError {
  return new RecoverableMessageError({
    detail: getErrorReason(errorCode),
    code: errorCode,
    title: `[CID=${correlationId}] Recoverable message error`
  });
}
export function notRecoverableMessageError(
  errorCode: NotRecoverableMessageErrorCodes,
  signal: Signal,
  correlationId = ""
): NotRecoverableMessageError {
  return new NotRecoverableMessageError({
    detail: getErrorReason(errorCode),
    code: errorCode,
    title: `[CID=${correlationId}] Not recoverable error`,
    signal: {
      ...signal,
      errorReason: getErrorReason(errorCode)
    }
  });
}

export function notRecoverableGenericMessageError(
  errorCode: NotRecoverableMessageErrorCodes,
  signal: unknown,
  correlationId = ""
): NotRecoverableGenericMessageError {
  return new NotRecoverableGenericMessageError({
    detail: getErrorReason(errorCode),
    code: errorCode,
    title: `[CID=${correlationId}] Not recoverable error`,
    signal
  });
}
