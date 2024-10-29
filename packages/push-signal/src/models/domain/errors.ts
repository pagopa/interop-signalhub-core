import { ApiError, makeApiProblemBuilder } from "pagopa-signalhub-commons";

export const errorCodes = {
  operationPushForbidden: "0004",
  signalDuplicate: "0002",
  signalNotSended: "0003",
  validationError: "0001",
};

export type ErrorCodes = keyof typeof errorCodes;

export const makeApiProblem = makeApiProblemBuilder(errorCodes);

export function requestValidationError(message: string): ApiError<ErrorCodes> {
  return new ApiError({
    code: "validationError",
    detail: `ApiError during request validation: ${message}`,
    title: "Validation signal request",
  });
}

export function signalIdDuplicatedForEserviceId(
  signalId: number,
  eserviceId: string,
): ApiError<ErrorCodes> {
  return new ApiError({
    code: "signalDuplicate",
    detail: `ApiError during Signal creation with signalId ${signalId} and eserviceId ${eserviceId}`,
    title: "Duplicated signalId for an eserviceId",
  });
}

export function signalNotSendedToQueque(
  error: string,
  requestId?: number,
): ApiError<ErrorCodes> {
  return new ApiError({
    code: "signalNotSended",
    detail: `ApiError during Signal sending: error: ${error} (requestId: ${requestId})`,
    title: "Signal not sended to queque",
  });
}

export function operationPushForbidden({
  eserviceId,
  producerId,
}: {
  eserviceId: string;
  producerId: string;
}): ApiError<ErrorCodes> {
  return new ApiError({
    code: "operationPushForbidden",
    detail: `Insufficient privileges: producerId: ${producerId} cannot deposit signal for e-service with id ${eserviceId}; please verify if your e-service is published,in a valid state and if you enabled the use of Signal-hub`,
    title:
      "Insufficient privileges for operation push signal - Invalid e-service status or option 'use signal hub' is disabled",
  });
}
