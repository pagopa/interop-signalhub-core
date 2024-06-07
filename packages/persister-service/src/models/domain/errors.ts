import { Signal } from "signalhub-commons";
import { DeadSignal } from "./model.js";

export class PersisterServiceError<T> extends Error {
  public code: T;
  public title: string;
  public detail: string;

  constructor({
    code,
    title,
    detail,
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
  public signal: any;
  constructor({
    code,
    title,
    detail,
    signal,
  }: {
    code: NotRecoverableMessageErrorCodes;
    title: string;
    detail: string;
    signal: any;
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
    signal,
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
  dbConnection: "0001",
};
export const notRecoverableMessageErrorCodes = {
  duplicateSignal: "0002",
  parsingError: "0010",
  genericError: "0011",
};

export function getErrorReason(type: ErrorCodes): string {
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
  ["duplicateSignal", "The signal is already saved on database"],
  ["parsingError", "The signal could not be parsed"],
  ["dbConnection", "Database connection error"],
  ["genericError", "Generic error"],
]);

export function recoverableMessageError(
  errorCode: RecoverableMessageErrorCodes
): RecoverableMessageError {
  return new RecoverableMessageError({
    detail: getErrorReason(errorCode),
    code: errorCode,
    title: "Recoverable message error",
  });
}
export function notRecoverableMessageError(
  errorCode: NotRecoverableMessageErrorCodes,
  signal: Signal
): NotRecoverableMessageError {
  return new NotRecoverableMessageError({
    detail: getErrorReason(errorCode),
    code: errorCode,
    title: "Not recoverable error",
    signal: {
      ...signal,
      errorReason: getErrorReason(errorCode),
    },
  });
}

export function notRecoverableGenericMessageError(
  errorCode: NotRecoverableMessageErrorCodes,
  signal: any
): NotRecoverableGenericMessageError {
  return new NotRecoverableGenericMessageError({
    detail: getErrorReason(errorCode),
    code: errorCode,
    title: "Not recoverable error",
    signal,
  });
}
