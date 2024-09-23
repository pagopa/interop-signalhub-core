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

export function operationPullForbidden({
  purposeId,
  eserviceId,
}: {
  purposeId: string;
  eserviceId: string;
}): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `Insufficient privileges: cannot access to pull signals with voucher's purpose ${purposeId} for e-service PULL; please verify if the consumer has a valid agreement to pull signals to e-service ${eserviceId}`,
    code: "operationPullForbidden",
    title:
      "Insufficient privileges for operation pull signal - Invalid Agreement or Invalid Purpose",
  });
}
