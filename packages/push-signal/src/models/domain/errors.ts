import { ApiError, makeApiProblemBuilder } from "pagopa-signalhub-commons";

export const errorCodes = {
  validationError: "0001",
  signalDuplicate: "0002",
  signalNotSended: "0003",
  operationPushForbidden: "0004",
};

export type ErrorCodes = keyof typeof errorCodes;

export const makeApiProblem = makeApiProblemBuilder(errorCodes);

export function requestValidationError(message: string): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `ApiError during request validation: ${message}`,
    code: "validationError",
    title: "Validation signal request",
  });
}

export function signalIdDuplicatedForEserviceId(
  signalId: number,
  eserviceId: string
): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `ApiError during Signal creation with signalId ${signalId} and eserviceId ${eserviceId}`,
    code: "signalDuplicate",
    title: "Duplicated signalId for an eserviceId",
  });
}

export function signalNotSendedToQueque(
  error: string,
  requestId?: number
): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `ApiError during Signal sending: error: ${error} (requestId: ${requestId})`,
    code: "signalNotSended",
    title: "Signal not sended to queque",
  });
}

export function operationPushForbiddenGeneric({
  purposeId,
  eserviceId,
}: {
  purposeId: string;
  eserviceId: string;
}): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `Insufficient privileges: cannot access to to e-service ${eserviceId}, with voucher's purpose ${purposeId} for e-service PUSH`,
    code: "operationPushForbidden",
    title: "Insufficient privileges for operation push signal - Generic Error",
  });
}

export function operationPushForbiddenWrongEservice({
  eservice,
}: {
  eservice?: { id?: string; state?: string; producerId?: string };
}): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `Insufficient privileges: invalid or unpublished e-service: producer ${eservice?.producerId}, e-service ${eservice?.id}, state ${eservice?.state} cannot deposit signal`,
    code: "operationPushForbidden",
    title:
      "Insufficient privileges for operation push signal - Invalid e-service",
  });
}
