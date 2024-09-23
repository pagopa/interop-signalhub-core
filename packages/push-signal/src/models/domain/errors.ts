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

export function operationPushForbidden({
  purposeId,
  eserviceId,
}: {
  purposeId: string;
  eserviceId: string;
}): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `Insufficient privileges: cannot access to push signals with voucher's purpose ${purposeId} for e-service PUSH; please verify if your e-service ${eserviceId} is published or in a valid state`,
    code: "operationPushForbidden",
    title:
      "Insufficient privileges for operation push signal - Invalid e-service status od Invalid Purpose",
  });
}
