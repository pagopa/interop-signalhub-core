import { ApiError, makeApiProblemBuilder } from "pagopa-signalhub-commons";

export const errorCodes = {
  operationPullForbidden: "0004",
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

export function operationPullForbidden({
  consumerId,
  eserviceId,
}: {
  consumerId: string;
  eserviceId: string;
}): ApiError<ErrorCodes> {
  return new ApiError({
    code: "operationPullForbidden",
    detail: `Insufficient privileges: your organization (id: ${consumerId}) cannot access to pull signals for e-service with id ${eserviceId}. Please verify if you have a valid agreement and at least one valid purpose to pull signals. Verify also if that e-service is enabled for using Signal Hub.`,
    title:
      "Insufficient privileges for operation pull signal - Invalid Agreement or Invalid Purpose",
  });
}
