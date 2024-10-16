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
  eserviceId,
  consumerId,
}: {
  consumerId: string;
  eserviceId: string;
}): ApiError<ErrorCodes> {
  return new ApiError({
    detail: `Insufficient privileges: your organization (id: ${consumerId}) cannot access to pull signals for e-service with id ${eserviceId}. Please verify if you have a valid agreement and at least one valid purpose to pull signals. Verify also if that e-service is enabled for using Signal Hub.`,
    code: "operationPullForbidden",
    title:
      "Insufficient privileges for operation pull signal - Invalid Agreement or Invalid Purpose",
  });
}
