import { ApiError, makeApiProblemBuilder } from "pagopa-signalhub-commons";

export const errorCodes = {
  validationError: "0001",
  signalDuplicate: "0002",
  signalNotSended: "0003",
  operationPullForbidden: "0004",
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
  signalId: number,
  error: string
): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `ApiError during Signal sending with RequestId ${signalId}, error: ${error}`,
    code: "signalNotSended",
    title: "Signal not sended to queque",
  });
}

export function operationPullForbidden({
  purposeId,
  consumerId,
}: {
  purposeId?: string;
  consumerId?: string;
}): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `Insufficient privileges: subject with purpose ${purposeId} and consumer ${consumerId} cannot access to eservice`,
    code: "operationPullForbidden",
    title: "Insufficient privileges for operation pull signal",
  });
}
