import { ApiError, makeApiProblemBuilder } from "pagopa-signalhub-commons";

export const errorCodes = {
  validationError: "0001",
  signalDuplicate: "0002",
  signalNotSended: "0003",
  operationPushForbidden: "0004",
  signalsConsolidatedWithHigherSignalId: "0005"
};

export type ErrorCodes = keyof typeof errorCodes;

export const makeApiProblem = makeApiProblemBuilder(errorCodes);

export function requestValidationError(message: string): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `ApiError during request validation: ${message}`,
    code: "validationError",
    title: "Validation signal request"
  });
}

export function signalIdDuplicatedForEserviceId(
  signalId: number,
  eserviceId: string
): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `ApiError during Signal creation with signalId ${signalId} and eserviceId ${eserviceId}`,
    code: "signalDuplicate",
    title: "Duplicated signalId for an eserviceId"
  });
}

export function signalsConsolidatedWithHigherSignalId(
  signalId: number,
  eserviceId: string
): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `ApiError during Signal creation: At least one signal with signalId > ${signalId} for ${eserviceId} has already available on database`,
    code: "signalsConsolidatedWithHigherSignalId",
    title: "Signal with higher value for signalId is already on database"
  });
}

export function signalNotSendedToQueque(
  error: string,
  requestId?: number
): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `ApiError during Signal sending: error: ${error} (requestId: ${requestId})`,
    code: "signalNotSended",
    title: "Signal not sended to queque"
  });
}

export function operationPushForbidden({
  producerId,
  eserviceId
}: {
  producerId: string;
  eserviceId: string;
}): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `Insufficient privileges: producerId: ${producerId} cannot deposit signal for e-service with id ${eserviceId}; please verify if your e-service is published,in a valid state and if you enabled the use of Signal-hub`,
    code: "operationPushForbidden",
    title:
      "Insufficient privileges for operation push signal - Invalid e-service status or option 'use signal hub' is disabled"
  });
}
