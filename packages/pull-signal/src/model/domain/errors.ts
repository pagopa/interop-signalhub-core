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
export function operationPullForbiddenGeneric({
  purposeId,
  eserviceId,
}: {
  purposeId: string;
  eserviceId: string;
}): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `Insufficient privileges: cannot access to to e-service ${eserviceId}, with voucher's purpose ${purposeId} for e-service PULL, `,
    code: "operationPullForbidden",
    title: "Insufficient privileges for operation pull signal - Generic Error",
  });
}

export function operationPullForbiddenWrongAgreement({
  eservice,
  agreement,
}: {
  eservice?: { id?: string };
  agreement?: { id?: string; state?: string; consumerId?: string };
}): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `Insufficient privileges: invalid agreement: consumer ${agreement?.consumerId} with agreement ${agreement?.id}, state ${agreement?.state} cannot access to e-service ${eservice?.id}`,
    code: "operationPullForbidden",
    title:
      "Insufficient privileges for operation pull signal - Invalid Agreement",
  });
}
